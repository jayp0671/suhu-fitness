import { AddFoodModal } from "@/components/nutrition/AddFoodModal";
import { FoodEntry, FoodItem } from "@/components/nutrition/FoodItem";

type MealSectionProps = {
  meal: string;
  items: FoodEntry[];
};

export function MealSection({ meal, items }: MealSectionProps) {
  const total = items.reduce((sum, item) => {
    return sum + Number(item.calories ?? 0);
  }, 0);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold capitalize text-white">{meal}</h2>
          <p className="text-xs text-neutral-500">{total} calories</p>
        </div>

        <AddFoodModal meal={meal} />
      </div>

      <div className="space-y-2">
        {items.length ? (
          items.map((item) => <FoodItem key={item.id} item={item} />)
        ) : (
          <p className="rounded-2xl bg-white/[0.03] p-4 text-sm text-neutral-500">
            Nothing logged yet.
          </p>
        )}
      </div>
    </section>
  );
}
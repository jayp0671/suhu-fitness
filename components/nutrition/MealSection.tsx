import { AddFoodModal } from "@/components/nutrition/AddFoodModal";
import { FoodItem } from "@/components/nutrition/FoodItem";

export function MealSection({ meal, items }: { meal: string; items: any[] }) {
  const total = items.reduce((sum, item) => sum + Number(item.calories ?? 0), 0);
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div><h2 className="capitalize font-semibold text-white">{meal}</h2><p className="text-xs text-neutral-500">{total} calories</p></div>
        <AddFoodModal meal={meal} />
      </div>
      <div className="space-y-2">{items.length ? items.map((item) => <FoodItem key={item.id} item={item} />) : <p className="rounded-2xl bg-white/[0.03] p-4 text-sm text-neutral-500">Nothing logged yet.</p>}</div>
    </section>
  );
}

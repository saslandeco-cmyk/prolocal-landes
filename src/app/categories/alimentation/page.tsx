import CategoryPage from "@/components/category/CategoryPage";
import { CATEGORY_META } from "@/lib/categoryData";

export default function Page() {
  return <CategoryPage meta={CATEGORY_META["alimentation"]} />;
}

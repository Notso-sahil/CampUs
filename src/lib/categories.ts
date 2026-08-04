import drafterSetImg from "@/assets/categories/drafter-set.jpg";
import sheetBoxImg from "@/assets/categories/sheet-box.jpg";
import calculatorImg from "@/assets/categories/calculator.jpg";
import labCoatImg from "@/assets/categories/lab-coat.jpg";
import apronImg from "@/assets/categories/apron.jpg";
import otherImg from "@/assets/categories/other.jpg";
import bookImg from "@/assets/categories/book.jpg";

export interface Category {
  value: string;
  label: string;
  image: string;
}

export const PRODUCT_CATEGORIES: Category[] = [
  { value: "Drafter Set", label: "Drafter Set", image: drafterSetImg },
  { value: "Sheet Box", label: "Sheet Box", image: sheetBoxImg },
  { value: "Calculator", label: "Calculator", image: calculatorImg },
  { value: "Lab Coat", label: "Lab Coat", image: labCoatImg },
  { value: "Apron", label: "Apron", image: apronImg },
  { value: "Book", label: "Book", image: bookImg },
  { value: "Other", label: "Other", image: otherImg },
];

export const CATEGORY_VALUES = PRODUCT_CATEGORIES.map((c) => c.value);

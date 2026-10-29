import ProductPriceEditor from "../../components/product/ProductPriceEditor";

export const metadata = {
    title: 'Price Management | Shalban Food Admin',
    robots: {
        index: false,
        follow: false,
    },
};

export default function ProductPricesPage() {
    return <ProductPriceEditor />;
}
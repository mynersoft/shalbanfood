"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSlice, configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

// Redux Slice
const productSlice = createSlice({
    name: "products",
    initialState: {
        categories: {},
        allProducts: [],
        activeCategory: null,
        loading: false,
        searchText: "",
    },
    reducers: {
        setProductsByCategory(state, action) {
            state.categories = action.payload;
        },
        setAllProducts(state, action) {
            state.allProducts = action.payload;
        },
        setActiveCategory(state, action) {
            state.activeCategory = action.payload;
        },
        setLoading(state, action) {
            state.loading = action.payload;
        },
        setSearchText(state, action) {
            state.searchText = action.payload;
        },
    },
});

const {
    setProductsByCategory,
    setAllProducts,
    setActiveCategory,
    setLoading,
    setSearchText,
} = productSlice.actions;

const store = configureStore({
    reducer: {
        products: productSlice.reducer,
    },
});

function ProductListPage() {
    const dispatch = useDispatch();
    const {
        categories,
        allProducts,
        activeCategory,
        loading,
        searchText,
    } = useSelector((state) => state.products);

    const [localProducts, setLocalProducts] = useState([]);
    const [changedRows, setChangedRows] = useState({});

    const loadData = async () => {
        try {
            dispatch(setLoading(true));

            const res = await fetch("/api/products/getbycat");
            const data = await res.json();

            let cats = data.categories || {};
            const sortedCats = {};
            Object.keys(cats)
                .sort((a, b) => a.localeCompare(b))
                .forEach((key) => (sortedCats[key] = cats[key]));

            dispatch(setProductsByCategory(sortedCats));
            const flat = Object.values(sortedCats).flat();
            dispatch(setAllProducts(flat));
            setLocalProducts(flat);

            dispatch(setLoading(false));
        } catch (err) {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredProducts = localProducts.filter((p) =>
        (p.name ?? "").toLowerCase().includes((searchText ?? "").toLowerCase())
    );

    const shownProducts =
        activeCategory === null
            ? filteredProducts
            : filteredProducts.filter((p) => p.category === activeCategory);

    // Update Price + Sell Price + Stock
    const updateProductData = async (id, regPrice, sellPrice, stock) => {
        try {
            const formData = new FormData();
            formData.append("regularPrice", regPrice);
            formData.append("sellPrice", sellPrice);
            formData.append("stock", stock);

            const res = await fetch(`/api/products/${id}/updateprice`, {
                method: "PUT",
                body: formData,
            });

            if (!res.ok) {
                toast.error("Update failed");
                return;
            }

            setLocalProducts((prev) =>
                prev.map((p) =>
                    p._id === id
                        ? {
                              ...p,
                              regularPrice: Number(regPrice),
                              sellPrice: Number(sellPrice),
                              stock: Number(stock),
                          }
                        : p
                )
            );

            setChangedRows((prev) => ({ ...prev, [id]: false }));

            toast.success("Updated successfully!");
        } catch (err) {
            toast.error("Update failed");
        }
    };





const downloadNamesAsTxt = () => {
    const names = shownProducts.map((p) => p.name).join("\n");

    const blob = new Blob([names], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "product-names.txt";
    link.click();

    URL.revokeObjectURL(url);
};



    // Excel Export
    const exportToExcel = () => {
        const excelData = shownProducts.map((p, i) => ({
            SL: i + 1,
            Name: p.name,
            RegularPrice: p.regularPrice ?? "",
            SellPrice: p.sellPrice ?? "",
            Stock: p.stock ?? "",
            Remarks: p.remarks ?? "",
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Products");
        XLSX.writeFile(wb, "products.xlsx");
    };

    // Print Table (same UI)
    const printTable = () => {
        const colSize = Math.ceil(shownProducts.length / 2);
        const leftCol = shownProducts.slice(0, colSize);
        const rightCol = shownProducts.slice(colSize);

        const makeTable = (list, startIndex) => `
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Name</th>
                <th>Regular Price</th>
                <th>Sell Price</th>
                <th>Stock</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${list
                  .map(
                      (p, i) => `
                  <tr>
                    <td>${startIndex + i}</td>
                    <td>${p.name}</td>
                    <td>${p.regularPrice ?? ""}</td>
                    <td>${p.sellPrice ?? ""}</td>
                    <td>${p.stock ?? ""}</td>
                    <td>${p.remarks ?? ""}</td>
                  </tr>`
                  )
                  .join("")}
            </tbody>
          </table>
        `;

        const win = window.open("", "", "width=900,height=600");
        win.document.write(`
            <html>
            <head>
              <style>
                body { display: flex; gap: 15px; padding: 20px; font-family: Arial; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #000; padding: 6px; font-size: 12px; }
                .col { width: 50%; }
              </style>
            </head>
            <body>
              <div class="col">${makeTable(leftCol, 1)}</div>
              <div class="col">${makeTable(rightCol, colSize + 1)}</div>
            </body>
            </html>
        `);

        win.document.close();
        win.print();
    };

    return (
        <div className="flex min-h-screen bg-gray-100">

            {/* Sidebar (always visible, hide option removed) */}
            <aside className="w-72 bg-white shadow-md p-5 border-r">
                <h2 className="font-bold text-xl mb-4">Categories</h2>

                <ul className="space-y-2">
                    <li
                        className={`p-2 rounded cursor-pointer ${
                            activeCategory === null
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100"
                        }`}
                        onClick={() => dispatch(setActiveCategory(null))}
                    >
                        All Products ({allProducts.length})
                    </li>

                    {Object.keys(categories).map((cat) => (
                        <li
                            key={cat}
                            className={`p-2 rounded cursor-pointer ${
                                activeCategory === cat
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100"
                            }`}
                            onClick={() => dispatch(setActiveCategory(cat))}
                        >
                            {cat} ({categories[cat]?.length || 0})
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <h1 className="text-3xl font-bold mb-6">
                    {activeCategory === null ? "All Products" : activeCategory}
                </h1>

                <input
                    type="text"
                    placeholder="Search product..."
                    className="border px-4 py-2 rounded w-80 mb-6 shadow-sm"
                    value={searchText}
                    onChange={(e) => dispatch(setSearchText(e.target.value))}
                />

                <div className="flex gap-4 mb-6">
                    <button
                        onClick={exportToExcel}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded shadow"
                    >
                        Export Excel
                    </button>

                    <button
                        onClick={printTable}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded shadow"
                    >
                        Print
                    </button>

<button
    onClick={downloadNamesAsTxt}
    className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded shadow"
>
    Download Names (.txt)
</button>

                </div>

                {loading && <p>Loading...</p>}

                <table className="w-full bg-white shadow rounded overflow-hidden">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-3 border">SL</th>
                            <th className="p-3 border">Product Name</th>
                            <th className="p-3 border">Regular Price</th>
                            <th className="p-3 border">Sell Price</th>
                            <th className="p-3 border">Stock</th>
                            <th className="p-3 border">Save</th>
                            <th className="p-3 border">Remarks</th>
                        </tr>
                    </thead>

                    <tbody>
                        {shownProducts.map((p, i) => (
                            <tr key={p._id} className="hover:bg-gray-50">
                                <td className="border p-2">{i + 1}</td>
                                <td className="border p-2">{p.name}</td>

                                {/* Regular Price */}
                                <td className="border p-2">
                                    <input
                                        type="number"
                                        value={p.regularPrice ?? ""}
                                        onChange={(e) => {
                                            const updated = localProducts.map(
                                                (prod) =>
                                                    prod._id === p._id
                                                        ? {
                                                              ...prod,
                                                              regularPrice:
                                                                  e.target.value,
                                                          }
                                                        : prod
                                            );
                                            setLocalProducts(updated);
                                            setChangedRows((prev) => ({
                                                ...prev,
                                                [p._id]: true,
                                            }));
                                        }}
                                        className="border px-2 py-1 w-24 rounded"
                                    />
                                </td>

                                {/* Sell Price */}
                                <td className="border p-2">
                                    <input
                                        type="number"
                                        value={p.sellPrice ?? ""}
                                        onChange={(e) => {
                                            const updated = localProducts.map(
                                                (prod) =>
                                                    prod._id === p._id
                                                        ? {
                                                              ...prod,
                                                              sellPrice:
                                                                  e.target.value,
                                                          }
                                                        : prod
                                            );
                                            setLocalProducts(updated);
                                            setChangedRows((prev) => ({
                                                ...prev,
                                                [p._id]: true,
                                            }));
                                        }}
                                        className="border px-2 py-1 w-24 rounded"
                                    />
                                </td>

                                {/* Stock */}
                                <td className="border p-2">
                                    <input
                                        type="number"
                                        value={p.stock ?? ""}
                                        onChange={(e) => {
                                            const updated = localProducts.map(
                                                (prod) =>
                                                    prod._id === p._id
                                                        ? {
                                                              ...prod,
                                                              stock:
                                                                  e.target.value,
                                                          }
                                                        : prod
                                            );
                                            setLocalProducts(updated);
                                            setChangedRows((prev) => ({
                                                ...prev,
                                                [p._id]: true,
                                            }));
                                        }}
                                        className="border px-2 py-1 w-20 rounded"
                                    />
                                </td>

                                {/* Save Button */}
                                <td className="border p-2">
                                    <button
                                        disabled={!changedRows[p._id]}
                                        onClick={() =>
                                            updateProductData(
                                                p._id,
                                                p.regularPrice,
                                                p.sellPrice,
                                                p.stock
                                            )
                                        }
                                        className={`px-3 py-1 rounded text-white ${
                                            changedRows[p._id]
                                                ? "bg-blue-500 hover:bg-blue-600"
                                                : "bg-gray-400 cursor-not-allowed"
                                        }`}
                                    >
                                        Save
                                    </button>
                                </td>

                                <td className="border p-2">
                                    {p.remarks || ""}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
}

export default function Page() {
    return (
        <Provider store={store}>
            <ProductListPage />
        </Provider>
    );
}
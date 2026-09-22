import AddTransactionForm from "@/components/TransectionForm";
import TransactionTable from "@/components/TransectionTable";

export default function Home() {
  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h2>Income & Investment Tracker</h2>
      <AddTransactionForm />
      <TransactionTable />
    </div>
  );
}
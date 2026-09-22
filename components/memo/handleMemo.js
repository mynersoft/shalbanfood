export const handlePrint = () => {
	const content = document.getElementById("memo").innerHTML;
	const w = window.open("", "", "width=900,height=700");
	w.document.write(`
			<html>
				<head>
					<title>Memo</title>
					<style>
						body { font-family: Arial; padding: 20px; color: #000; }
						table { width: 100%; border-collapse: collapse; margin-top: 10px; }
						th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
						th { background: #f0f0f0; }
						.text-right { text-align: right; }
					</style>
				</head>
				<body>${content}</body>
			</html>
		`);
	w.document.close();
	w.print();
};

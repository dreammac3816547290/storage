
//#region src/index.ts
function Column(input) {
	return input;
}
function Table({ name, columns }) {
	if (!Array.isArray(columns)) throw new Error("table creation error");
	return {
		name,
		columns: Object.fromEntries(columns.map((column) => [column.name, column]))
	};
}
function Schema({ tables }) {
	if (!Array.isArray(tables)) throw new Error("schema creation error");
	return { tables: Object.fromEntries(tables.map((table) => [table.name, table])) };
}
Schema({ tables: [Table({
	name: "product",
	columns: [
		Column({
			name: "id",
			type: "number",
			nullable: false
		}),
		Column({
			name: "name",
			type: "string",
			nullable: false
		}),
		Column({
			name: "price",
			type: "number",
			nullable: false
		})
	]
}), Table({
	name: "order",
	columns: [Column({
		name: "id",
		type: "number",
		nullable: false
	}), Column({
		name: "quantity",
		type: "number",
		nullable: false
	})]
})] });

//#endregion
exports.Column = Column;
exports.Schema = Schema;
exports.Table = Table;
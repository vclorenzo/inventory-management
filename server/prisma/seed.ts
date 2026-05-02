import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

/** Primary-key field per Prisma model (camelCase name from seed JSON filename). */
const MODEL_ID_FIELD: Record<string, string> = {
	users: 'userId',
	products: 'productId',
	sales: 'saleId',
	purchases: 'purchaseId',
	expenses: 'expenseId',
	salesSummary: 'salesSummaryId',
	purchaseSummary: 'purchaseSummaryId',
	expenseSummary: 'expenseSummaryId',
	expenseByCategory: 'expenseByCategoryId',
};

async function main() {
	const dataDirectory = path.join(__dirname, 'seedData');

	const orderedFileNames = [
		'products.json',
		'expenseSummary.json',
		'sales.json',
		'salesSummary.json',
		'purchases.json',
		'purchaseSummary.json',
		'users.json',
		'expenses.json',
		'expenseByCategory.json',
	];

	for (const fileName of orderedFileNames) {
		const filePath = path.join(dataDirectory, fileName);
		const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
		const modelName = path.basename(fileName, path.extname(fileName));
		const model: any = prisma[modelName as keyof typeof prisma];

		if (!model) {
			console.error(`No Prisma model matches the file name: ${fileName}`);
			continue;
		}

		const idField = MODEL_ID_FIELD[modelName];

		for (const data of jsonData) {
			if (idField && idField in data && typeof model.upsert === 'function') {
				const id = data[idField as keyof typeof data];
				const { [idField]: _id, ...updateFields } = data;
				await model.upsert({
					where: { [idField]: id },
					create: data,
					update: updateFields,
				});
			} else {
				await model.create({ data });
			}
		}

		console.log(`Seeded ${modelName} with data from ${fileName}`);
	}
}

main()
	.catch((e) => {
		console.error(e);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

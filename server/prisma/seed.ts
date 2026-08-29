import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

/** Stable owner per product — same productId always maps to the same user. */
function pickProductOwnerId(productId: string, userIds: string[]): string {
	let hash = 0;
	for (let i = 0; i < productId.length; i++) {
		hash = (hash * 31 + productId.charCodeAt(i)) >>> 0;
	}
	return userIds[hash % userIds.length];
}

const MODEL_ID_FIELD: Record<string, string> = {
	users: 'userId',
	products: 'productId',
	auctions: 'productId',
	sales: 'saleId',
	purchases: 'purchaseId',
	expenses: 'expenseId',
	salesSummary: 'salesSummaryId',
	purchaseSummary: 'purchaseSummaryId',
	expenseSummary: 'expenseSummaryId',
	expenseByCategory: 'expenseByCategoryId',
	reviews: 'reviewId',
};

async function main() {
	const dataDirectory = path.join(__dirname, 'seedData');

	const usersPath = path.join(dataDirectory, 'users.json');
	const userIds: string[] = JSON.parse(fs.readFileSync(usersPath, 'utf-8')).map(
		(u: { userId: string }) => u.userId,
	);

	const orderedFileNames = [
		'users.json',
		'reviews.json',
		'products.json',
		'auctions.json',
		'expenseSummary.json',
		'sales.json',
		'salesSummary.json',
		'purchases.json',
		'purchaseSummary.json',
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
			if (modelName === 'users' && data.password && !data.password.startsWith('$2')) {
				data.password = await bcrypt.hash(data.password, 10);
			}

			if (
				(modelName === 'products' || modelName === 'auctions') &&
				data.productId
			) {
				data.userId = pickProductOwnerId(data.productId, userIds);
			}

			if (
				(modelName === 'sales' || modelName === 'purchases') &&
				data.productId
			) {
				const product = await prisma.products.findUnique({
					where: { productId: data.productId },
					select: { productId: true },
				});
				if (!product) {
					continue;
				}
			}

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

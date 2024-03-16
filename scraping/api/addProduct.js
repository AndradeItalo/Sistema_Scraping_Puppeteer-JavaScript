// Requer a configuração do banco de dados Prisma.
const { db: prisma } = require('../lib/db');

// Função assíncrona para inserir dados dos produtos no banco de dados.
async function POST(datas) {
    try {
        for (const data of datas) {
            const { title, price, description, avaliation, feedbacks, link, image } = data;
            // Cria um novo registro de produto no banco de dados com os dados coletados.
            await prisma.product.create({
                data: {
                    title: title,
                    price: price,
                    description: description,
                    avaliation: avaliation,
                    feedbacks: JSON.stringify(feedbacks), // Converte feedbacks em string JSON.
                    link: link,
                    image: image
                }
            });
        }

        console.log("NOVO PRODUTO"); // Log de sucesso.
    } catch (error) {
        console.error(error); // Caso houver erro durante a inserção.
    }
}

// Exporta a função POST para usar no index e fazer a inserção no banco de dados.
module.exports = {
    POST
};

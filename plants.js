const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'root',
        database: 'plant_db',
    },
});
// `GET /plants` : Récupérer toutes les plantes.
app.get('/plants', async (req, res) => {
    try {
        // SELECT plants.id, plants.name, categories.label as category FROM plants LEFT JOIN categories ON plants.category_id = categories.id;
        const plants = await knex('plants')
            .select('plants.id', 'plants.name', 'categories.label as category')
            .leftJoin('categories', 'plants.category_id', 'categories.id');
        res.status(200).json(plants);
    } catch (error) {
        res.status(500).json(error);
    }
}); // Liste




//- `GET /plants/:id` : Récupérer les détails d'une plante spécifique.
app.get('/plants/:id', async (req, res) => {
    try {
        // SELECT * FROM plants WHERE id=:id
        const plants = await knex('plants')
            .where({
                id: req.params.id,
            })
            .select();

        if (plants.length === 0) {
            return res.status(404).json();
        }

        return res.status(200).json(plants[0]);
    } catch (error) {
        res.status(500).json(error);
    }
}); 




//- `POST /plants` : Ajouter une nouvelle plante en base de données (n'oubliez pas de lier un `category_id`).
app.post('/plants', async (req, res) => {
    try {
        const id = await knex('plants').returning('id').insert(req.body);
        const plants = await knex('plants').where({ id: id[0] }).select();
        res.status(201).json(plants[0]);
    } catch (error) {
        res.status(500).json(error);
    }
}); 





//- `GET /categories` : Récupérer la liste des catégories disponibles.
app.get('/categories', async (req, res) => {
    try {
        const categories = await knex('categories').select();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json(error);
    }
}); 

//- `DELETE /plants/:id`: Suppression d’une plante
app.delete('/plants/:id',async (req,res)=>{
    try {
        const nbrRecords = await knex('plants') .delete().where({id:req.params.id});
        if (nbrRecords === 0) {
            return res.status(404).json();
        }
        res.status(204).json();
    } catch (error) {
        res.status(500).json(error);
    }
}); 

//- `GET /categories/:id/plants` : Récupère toutes les plantes appartenant à la catégorie dont l'ID est spécifié.
app.get('/categories/:id/plants', async (req, res) => {
    try {
        const plants = await knex('plants')
            .select('plants.id', 'plants.name')
            .where({ 'plants.category_id': req.params.id });
            if (req.params.id >6 || req.params.id < 1) {
                return res.status(404).json("Category not found");
            }
        res.status(200).json(plants);
    } catch (error) {
        res.status(404).json(error);
    }
});

app.listen(3000, () => {
    console.log('SERVER is running on port 3000');
    knex.raw('SELECT 1;')
        .then(() => {
            console.log('Database connection successful');
        })
        .catch((err) => {
            console.error('Database connection failed:', err);
            res.status(500).json(err);
        });
});
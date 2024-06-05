
// Importez dotenv et chargez les variables d'environnement depuis le fichier .env
require("dotenv").config();

const { Pool } = require("pg");

// Utilisez le module 'set' pour obtenir la valeur de DATABASE_URL depuis vos configurations
const s = require("../set");

// R�cup�rez l'URL de la base de donn�es de la variable s.DATABASE_URL
var dbUrl=s.DATABASE_URL?s.DATABASE_URL:"postgres://db_7xp9_user:6hwmTN7rGPNsjlBEHyX49CXwrG7cDeYi@dpg-cj7ldu5jeehc73b2p7g0-a.oregon-postgres.render.com/db_7xp9"
const proConfig = {
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false,
  },
};

// Cr�ez une pool de connexions PostgreSQL
const pool = new Pool(proConfig);

// Fonction pour cr�er la table "alive" avec une colonne "id"

async function creerTableMention() {
    const client = await pool.connect();
  try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS mention (
          id serial PRIMARY KEY,
          status text DEFAULT 'non',
          url text,
          type text,
          message text
        );
      `);
      console.log("La table 'mention' a �t� cr��e avec succ�s.");
    } catch (e) {
      console.error("Une erreur est survenue lors de la cr�ation de la table 'mention':", e);
    } finally {
        client.release();
      }
  };

creerTableMention();

  async function addOrUpdateDataInMention(url, type,message) {
      const client = await pool.connect();
      try {
          const query = `
              INSERT INTO mention (id, url, type, message)
              VALUES (1, $1, $2, $3)
              ON CONFLICT (id)
              DO UPDATE SET  url = excluded.url, type = excluded.type , message = excluded.message;
          `;
          const values = [url, type,message];
  
          await client.query(query, values);
          console.log("Donn�es ajout�es ou mises � jour dans la table 'mention' avec succ�s.");
      } catch (error) {
          console.error("Erreur lors de l'ajout ou de la mise � jour des donn�es dans la table 'mention':", error);
      } finally {
          client.release();
      }
  };
  
  
async function modifierStatusId1(nouveauStatus) {
    const client = await pool.connect();
    try {
        const query = `
            UPDATE mention
            SET status = $1
            WHERE id = 1;
        `;
        const values = [nouveauStatus];

        await client.query(query, values);
        console.log("Le status a �t� modifi� avec succ�s pour l'ID 1 dans la table 'mention'.");
    } catch (error) {
        console.error("Erreur lors de la modification du status pour l'ID 1 dans la table 'mention':", error);
    } finally {
        client.release();
    }
};

async function recupererToutesLesValeurs() {
    const client = await pool.connect();
    try {
        const query = `
            SELECT * FROM mention;
        `;

        const result = await client.query(query);
        console.log("Voici toutes les valeurs de la table 'mention':", result.rows);
        return result.rows;
    } catch (error) {
        console.error("Erreur lors de la r�cup�ration des valeurs de la table 'mention':", error);
    } finally {
        client.release();
    }
};

module.exports = {
                    addOrUpdateDataInMention,
                    recupererToutesLesValeurs,
                    modifierStatusId1,
}

const pgp = require('pg-promise')()

// const connection = { host: 'localhost', port: 5432, db: 'pets' }
const connection = process.env.NODE_ENV === 'test'
  ? 'postgres:///pets_test'
  : 'postgres:///pets'
const db = pgp(connection)

/**
 * Gets pets and species from db
 * @return {Promise} - resolves to array of objects, each with keys 'name' and 'species_name'
 */
const getPetsAndSpecies = () => {
  const query = `SELECT p.name, s.species_name, p.pet_id
                  FROM pets AS p
                  JOIN species AS s
                    ON s.species_id = p.species_id
                `
  return db.any(query)
}

/**
 * Update a pet's name in the database
 * @param  {number} petId - id of the pet to update
 * @param  {string} newName - new name for pet
 * @return {Promise} - resolves to object with keys 'success' and 'message'
 */
const updatePetName = (petId, newName) =>
  db.oneOrNone('UPDATE pets SET name=$1 WHERE pet_id=$2 RETURNING pet_id', [newName, petId])
    .then((returnedId) => {
      if (returnedId) return { success: true, message: 'Name changed!' }
      return { success: false, message: `Could not find petId ${petId}` }
    })
    .catch(err => Object({ success: false, message: err.message }))

module.exports = {
  db,
  getPetsAndSpecies,
  updatePetName,
}

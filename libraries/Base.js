const mongoDrive = require("mongodb").MongoClient;

class Base {
   /**
    * Definizione costanti.
    */
   c_server_invalid = "invalid server";
   c_port_invalid = "invalid port";
   c_dbname_invalid = "invalid dbname";
   c_collection_invalid = "invalid collection";
   c_document_invalid = "invalid document";
   c_document_key_invalid = "invalid document key";
   c_not_found = "not found";
   c_invalid_property = "invalid property";
   c_already_exists = "already exists";

   /**
    * Dichiarazione proprietà private.
    */
   #dbname = undefined;
   #server = undefined;
   #port = undefined;
   #client = undefined;

   /**
    * Costruttore della classe. Se richiesto, riutilizza connessione.
    */
   constructor(client = undefined) {
      if(client !== undefined)
         this.#client = client;
   };

   /**
    * Apre la connessione verso MongoDB.
    *
    * @param client
    *
    * @throws ex
    */
   async open(dbname = undefined, server = undefined, port = undefined) {
      // Se già specificato un Client, non ne viene generato un altro:
      try {
         if(this.#client === undefined) {

            // Controlla parametri:
            if(dbname === undefined || dbname.length === 0)
               throw this.c_dbname_invalid;

            if(server === undefined || server.length === 0)
               throw this.c_server_invalid;

            if(port === 0 || port > 65535)
               throw this.c_port_invalid;

            // Inizializza proprietà private:
            this.#dbname = dbname;
            this.#server = server;
            this.#port = port;

            this.#client = new mongoDrive(`mongodb://${this.#server}:${this.#port}\\`, {
               useNewUrlParser: true,
               useUnifiedTopology: true,
            });

            await this.#client.connect();
         }
      }
      catch(ex) {
         throw ex;
      }
   };

   /**
    * Chiude la connessione verso MongoDB.
    *
    * @throws ex
    */
   async close() {
      try {
         await this.#client.close();
         this.#client = undefined;
      }
      catch(ex) {
         throw ex;
      }
   };

   /**
    * Restituisce oggetto Client.
    */
   get client() {
      return this.#client;
   };

   /**
    * Carica il documento con l'_id specificato.
    *
    * @param collection
    * @param key
    * @return document
    *
    * @throws c_collection_invalid
    * @throws c_document_key_invalid
    * @throws c_not_found
    */
   async _load(collection, key) {
      // Inizializza proprietà locali:
      let document = undefined;

      // Controllo parametri:
      if(collection === undefined || collection.length === 0)
         throw this.c_collection_invalid;

      if(key === undefined || key.length === 0)
         throw this.c_document_key_invalid;

      // Cerca il documento con la chiave specificata:
      document = await this._find(collection, key);
      if(document.length === 0)
         throw this.c_not_found;

      // Restituisce documento:
      return document;
   };

   /**
    * Registra documento nella base dati. A questo livello nessun controllo viene
    * fatto sui dati.
    *
    * @param collection
    * @param key
    * @param document
    * @param upsert
    *
    * @throws c_collection_invalid
    * @throws c_document_key_invalid
    * @throws c_document_invalid
    * @throws ex
    */
   async _save(collection, key, document, upsert = true) {
      // Controlla correttezza dei parametri:
      if(collection === undefined || collection.length === 0)
         throw this.c_collection_invalid;

      if(key === undefined || key.length === 0)
         throw this.c_document_key_invalid;

      if(document === undefined)
         throw this.c_document_invalid;

      // Inserisce o aggiorna documento:
      try {
         await this.#client.db(this.#dbname).collection(collection).findOneAndUpdate(
            { "_id": key },
            { "$set": document },
            { "upsert": true, "returnDocument": "after" }
         );
      }
      catch(ex) {
         throw ex;
      }
   };

   /**
    * Elimina fisicamente un documento dalla collezione specificata.
    *
    * @param collection
    * @param filter
    *
    * @throws ex
    */
   async _remove(collection, filter = { }) {
      try {
         await this.#client.db(this.#dbname).collection(collection).deleteMany(filter);
      }
      catch(ex) {
         throw ex;
      }
   };

   /**
    * Cerca un documento nella collezione e con la chiave specificata.
    *
    * @param collection
    * @param filter
    * @param sort
    * @param options
    *
    * @throws ex
    */
   async _find(collection, filter = {}, sort = {}, options = {}) {
      // Inizializza proprietà locali:
      let cursor = undefined;
      let documents = [];

      // Cerca il documento con la chiave KEY nella collezione specificata:
      try {
         cursor = await this.#client.db(this.#dbname).collection(collection).find(filter, options).sort(sort);

         // Restituisce sempre un'array con i documenti trovati:
         await cursor.forEach(document => {
            documents.push(document);
         });
      }
      catch(ex) {
         throw ex;
      }

      // Restituisce lista documento trovati:
      return documents;
   };

   /**
    * Permette di incrementare il contatore per la collezione specificata.
    *
    * @param collection
    * @param name
    *
    * @throws ex
    */
   async _getIntervalNextNumber(collection, name = "counter") {
      // Inizializza proprietà locali:
      let id = 0;

      // Nuovo counter:
      try {
         await this.#client.db(this.#dbname).collection(collection).findOneAndUpdate(
            { "_id": name},
            { "$inc": { "value": 1 } },
            { "upsert": true, "returnDocument": "after" }
         ).then(result => {
            id = result.value.value;
         });
      }
      catch(ex) {
         throw ex;
      }

      return id;
   };
}

/**
 * Esporta la classe Base.
 */
module.exports = Base;
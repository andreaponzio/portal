/**
 * Moduli e istanza oggetti.
 */
const Base = require("../libraries/Base");

/**
 * Classe Application.
 */
class Application extends Base {
   /**
    * Dichiarazione proprietà private.
    */
   #application = {};

   /**
    * Costruttore della classe Application.
    */
   constructor() {
      super();
   };

   /**
    * Get delle proprietà dell'applicazione.
    */
   get name() {
      return this.#application.name;
   };
   get title() {
      return this.#application.title;
   };
   get description() {
      return this.#application.description;
   };
   get image() {
      return this.#application.image;
   };
   get sortid() {
      return this.#application.sortid;
   };
   get locked() {
      return this.#application.locked;
   };
   get created_at() {
      return this.#application.created_at;
   };
   get changed_at() {
      return this.#application.changed_at;
   };

   /**
    * Set delle proprietà dell'applicazione.
    */
   set title(value) {
      this.#application.title = value || undefined;
   };
   set description(value) {
      this.#application.description = value || undefined;
   };
   set image(value) {
      this.#application.image = value || undefined;
   };
   set sortid(value) {
      this.#application.sortid = value || undefined;
   };
   set locked(value) {
      this.#application.locked = value || undefined;
   };

   /**
    * Controllo presenza sulle proprietà obbligatorie.
    *
    * @throws c_invalid_property
    */
   isCorrect() {
      // Verifica proprietà:
      if(this.#application === {})
         throw this.c_invalid_property;

      if(this.#application.title === undefined || this.#application.description === undefined ||
         this.#application.image === undefined || this.#application.sortid === undefined)
         throw this.c_invalid_property;
   };

   /**
    * Prepara la classe per un nuova applicazione.
    *
    * @param name
    *
    * @throws c_invalid_property
    * @throws c_already_exists
    */
   async new(name) {
      // Inizializza proprietà locali:
      let documents = [];

      // Controlla presenza del nome dell'applicazione:
      if(name === undefined || name.length === 0)
         throw this.c_invalid_property;

      // Esiste già un'applicazione con questo nome?
      documents = await super._find("applications", { "_id": name });
      if(documents.length !== 0)
         throw this.c_already_exists;

      // Reimposta l'anagrafica in modo che sia possibile crearne un'altra:
      this.#application = {};
      this.#application.type = "application";
      this.#application.name = name;
      this.#application.sortid = 0;
      this.#application.locked = false;
   };

   /**
    * Legge l'anagrafica dell'applicazione con il nome specificato.
    *
    * @param name
    *
    * @throws c_invalid_property
    * @throws ex
    */
   async load(name) {
      // Inizializza proprietà locali:
      let documents = [];

      // Controllo presenza del nome applicazione:
      if(name === undefined || name.length === 0)
         throw this.c_invalid_property;

      // Cerca e legge l'applicazione:
      try {
         documents = await super._load("applications", {"_id": name});
      }
      catch(ex) {
         throw   ex;
      }

      // Valorizza proprietà privata:
      this.#application = documents[0];
   };

   /**
    * Registra l'applicazione.
    *
    * @throws ex
    */
   async save() {
      try {
         // Controlla proprietà:
         this.isCorrect();

         // Completa proprietà dell'applicazione:
         if(this.#application.created_at === undefined)
            this.#application.created_at = new Date().toISOString();
         else
            this.#application.changed_at = new Date().toISOString();

         // Registra anagrafica:
         await super._save("applications", this.#application.name, this.#application);
      }
      catch(ex) {
         throw ex;
      }
   }

   /**
    * Elimina o blocca l'applicazione.
    *
    * @throws ex
    *
    * @param physical_deletion
    */
   async remove(physical_deletion = false) {
      try {
         switch(physical_deletion) {
            case true:
               await super._remove("applications", {"_id": this.#application.name});
               break;

            case false:
               this.#application.locked = true;
               await this.save();
               break;
         }
      }
      catch(ex) {
         throw ex;
      }
   }

   /**
    * Cerca nelle applicazioni.
    *
    * @param filter
    * @param sort
    * @param options
    * @return documents
    *
    * @throws c_invalid_property
    * @throws ex
    */
   async find(filter = { "type": "application"}, sort = {}, options = {}) {
      // Inizializza proprietà locali:
      let documents = [];

      // Controlla presenza del filtro:
      if(filter === undefined || filter.length === 0)
         throw this.c_invalid_property;

      // Cerca le applicazioni in base al filtro:
      try {
         documents = await super._find("applications", filter, sort, options);
      }
      catch(ex) {
         throw ex;
      }

      // Restituisce utenti:
      return documents;
   }
}

/**
 * Esporta la classe Application.
 */
module.exports = Application;
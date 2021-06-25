/**
 * Moduli e istanza oggetti.
 */
const Base = require("../libraries/Base");

/**
 * Classe Profile.
 */
class Profile extends Base {
   /**
    * Dichiarazione proprietà private.
    */
   #profile = {};

   /**
    * Costruttore della classe Profile.
    */
   constructor(d) {
      super();
   };

   /**
    * Get delle proprietà del profilo.
    */
   get name() {
      return this.#profile.name;
   };
   get description() {
      return this.#profile.description;
   };
   get admin() {
      return this.#profile.admin;
   };
   get locked() {
      return this.#profile.locked;
   };
   get created_at() {
      return this.#profile.created_at;
   };
   get changed_at() {
      return this.#profile.changed_at;
   };
   get applications() {
      return this.#profile.applications;
   };

   /**
    * Set delle proprietà del profilo.
    */
   set description(value) {
      this.#profile.description = value || undefined;
   };
   set admin(value) {
      this.#profile.image = value || undefined;
   };
   set locked(value) {
      this.#profile.locked = value || undefined;
   };

   /**
    * Controllo presenza sulle proprietà obbligatorie.
    *
    * @throws c_invalid_property
    */
   isCorrect() {
      // Verifica proprietà:
      if(this.#profile === {})
         throw this.c_invalid_property;

      if(this.#profile.description === undefined)
         throw this.c_invalid_property;
   };

   /**
    * Prepara la classe per un nuovo profilo.
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
      documents = await super._find("profiles", { "_id": name });
      if(documents.length !== 0)
         throw this.c_already_exists;

      // Reimposta l'anagrafica in modo che sia possibile crearne un'altra:
      this.#profile = {};
      this.#profile.type = "profile";
      this.#profile.name = name;
      this.#profile.admin = false;
      this.#profile.locked = false;
   };

   /**
    * Legge l'anagrafica del profilo con il nome specificato.
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
         documents = await super._load("profiles", {"_id": name});
      }
      catch(ex) {
         throw ex;
      }

      // Valorizza proprietà privata:
      this.#profile = documents[0];
   };

   /**
    * Registra il profilo.
    *
    * @throws ex
    */
   async save() {
      try {
         // Controlla proprietà:
         this.isCorrect();

         // Completa proprietà del profilo:
         if(this.#profile.created_at === undefined)
            this.#profile.created_at = new Date().toISOString();
         else
            this.#profile.changed_at = new Date().toISOString();

         // Registra anagrafica:
         await super._save("profiles", this.#profile.name, this.#profile);
      }
      catch(ex) {
         throw ex;
      }
   }

   /**
    * Elimina o blocca il profilo.
    *
    * @param physical_deletion
    *
    * @throws ex
    */
   async remove(physical_deletion = false) {
      try {
         switch(physical_deletion) {
            case true:
               await super._remove("profiles", {"_id": this.#profile.name});
               break;

            case false:
               this.#profile.locked = true;
               await this.save();
               break;
         }
      }
      catch(ex) {
         throw ex;
      }
   }

   /**
    * Cerca nei profili.
    *
    * @param filter
    * @param sort
    * @param options
    * @return documents
    *
    * @throws c_invalid_property
    * @throws ex
    */
   async find(filter = { "type": "profile"}, sort = {}, options = {}) {
      // Inizializza proprietà locali:
      let documents = [];

      // Controlla presenza del filtro:
      if(filter === undefined || filter.length === 0)
         throw this.c_invalid_property;

      // Cerca le applicazioni in base al filtro:
      try {
         documents = await super._find("profiles", filter, sort, options);
      }
      catch(ex) {
         throw ex;
      }

      // Restituisce utenti:
      return documents;
   }

   /**
    * Aggiunge un applicazione al profilo.
    *
    * @param name
    *
    * @throws c_not_found
    */
   async add(name) {
      // Inizializza proprietà locali:
      let documents = [];

      // Verifica esistenza dell'applicazione da aggiungere:
      documents = await super._find("applications", { "_id": name });
      if(documents.length === 0)
         throw this.c_not_found;

      // Aggiunge applicazione all'elenco:
      if(this.#profile.applications === undefined)
         this.#profile.applications = [];
      this.#profile.applications.push(name);
   };

   /**
    * Elimina l'applicazione dall'elenco di quelle assegnate al profilo.
    *
    * @param name
    */
   del(name) {
      // Inizializza proprietà locali:
      let index = -1;

      // Elimina l'applicazione dall'elenco:
      if(this.#profile.applications !== undefined) {
         index = this.#profile.applications.indexOf(name);
         if(index !== -1)
            this.#profile.applications.splice(index, 1);
      }
   };
}

/**
 * Esporta la classe Profile.
 */
module.exports = Profile;
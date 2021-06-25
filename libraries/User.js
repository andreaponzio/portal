/**
 * Moduli e istanza oggetti.
 */
const Base = require("../libraries/Base");

/**
 * Classe User.
 */
class User extends Base {
   /**
    * Dichiarazione proprietà private.
    */
   #user = {};

   /**
    * Costruttore della classe User.
    */
   constructor() {
      super();
   };

   /**
    * Get delle proprietà dell'utente.
    */
   get email() {
      return this.#user.email;
   };
   get name() {
      return this.#user.name;
   };
   get password() {
      return this.#user.password;
   };
   get security() {
      return this.#user.security;
   };
   get locked() {
      return this.#user.locked;
   };
   get id() {
      return this.#user.id;
   };
   get profile() {
      return this.#user.profile;
   };
   get created_at() {
      return this.#user.created_at;
   };
   get changed_at() {
      return this.#user.changed_at;
   };

   /**
    * Set delle proprietà dell'utente.
    */
   set name(value) {
      this.#user.name = value || undefined;
   };
   set password(value) {
      this.#user.password = value || undefined;
   };
   set security(value) {
      this.#user.security = value || undefined;
   };
   set profile(value) {
      this.#user.profile = value || undefined;
   };
   set locked(value) {
      this.#user.locked = value || undefined;
   };

   /**
    * Controllo presenza sulle proprietà obbligatorie.
    *
    * @throws c_invalid_property
    */
   isCorrect() {
      // Verifica proprietà:
      if(this.#user === {})
         throw this.c_invalid_property;

      if(this.#user.name === undefined || this.#user.password === undefined ||
         this.#user.security === undefined || this.#user.profile === undefined)
         throw this.c_invalid_property;
   };

   /**
    * Prepara la classe per un nuova anagrafica.
    *
    * @param email
    *
    * @throws c_invalid_property
    * @throws c_already_exists
    */
   async new(email) {
      // Inizializza proprietà locali:
      let documents = [];

      // Controlla presenza dell'indirizzo e-mail:
      if(email === undefined || email.length === 0)
         throw this.c_invalid_property;

      // Esiste già un utente registrato con questo indirizzo e-mail?
      documents = await super._find("users", { "_id": email });
      if(documents.length !== 0)
         throw this.c_already_exists;

      // Reimposta l'anagrafica in modo che sia possibile crearne un'altra:
      this.#user = {};
      this.#user.type = "user";
      this.#user.email = email;
      this.#user.locked = false;
      this.#user.created_at = new Date().toISOString();
   };

   /**
    * Legge l'anagrafica dell'utente registrato con l'indirizzo e-mail specificato.
    *
    * @param email
    *
    * @throws c_invalid_property
    * @throws ex
    */
   async load(email) {
      // Inizializza proprietà locali:
      let documents = [];

      // Controllo presenza dell'indirizzo e-mail:
      if(email === undefined || email.length === 0)
         throw this.c_invalid_property;

      // Cerca e legge anagrafica utente:
      try {
         documents = await super._load("users", {"_id": email});
      }
      catch(ex) {
         throw ex;
      }

      // Valorizza proprietà privata:
      this.#user = documents[0];
   };

   /**
    * Registra l'anagrafica.
    *
    * @throws ex
    */
   async save() {
      try {
         // Controlla proprietà:
         this.isCorrect();

         // Genera identificativo se nuova anagrafica:
         if(this.#user.id === undefined)
            this.#user.id = await super._getIntervalNextNumber("users");
         else
            this.#user.changed_at = new Date().toISOString();

         // Registra anagrafica:
         await super._save("users", this.#user.email, this.#user);
      }
      catch(ex) {
         throw ex;
      }
   }

   /**
    * Elimina o blocca l'anagrafica corrente.
    *
    * @param physical_deletion
    *
    * @throws ex
    */
   async remove(physical_deletion = false) {
      try {
         switch(physical_deletion) {
            case true:
               await super._remove("users", {"_id": this.#user.email});
               break;

            case false:
               this.#user.locked = true;
               await this.save();
               break;
         }
      }
      catch(ex) {
         throw ex;
      }
   }

   /**
    * Cerca nell'anagrafica utenti.
    *
    * @param filter
    * @param sort
    * @param options
    * @return documents
    *
    * @throws c_invalid_property
    * @throws ex
    */
   async find(filter = { "type": "user"}, sort = {}, options = {}) {
      // Inizializza proprietà locali:
      let documents = [];

      // Controlla presenza del filtro:
      if(filter === undefined || filter.length === 0)
         throw this.c_invalid_property;

      // Cerca utenti in base al filtro:
      try {
         documents = await super._find("users", filter, sort, options);
      }
      catch(ex) {
         throw ex;
      }

      // Restituisce utenti:
      return documents;
   }
}

/**
 * Esporta la classe User.
 */
module.exports = User;
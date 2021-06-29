const Base = require("../libraries/Base");

class Chat extends Base {
   // Dichiarazione proprietà private:
   #chat = {};

   // Costruttore della classe Chat:
   constructor() {
      super();
   };

   // Get delle proprietà della chat:
   get id() {
      return this.#chat._id;
   };
   get title() {
      return this.#chat.title;
   };
   get locked() {
      return this.#chat.locked;
   };
   get closed() {
      return this.#chat.closed;
   };
   get external() {
      return this.#chat.external;
   };
   get created_at() {
      return this.#chat.created_at;
   };
   get changed_at() {
      return this.#chat.changed_at;
   };

   // Set delle proprietà della chat:
   set locked(value) {
      this.#chat.locked = value || undefined;
   };
   set closed(value) {
      this.#chat.closed = value || undefined;
   };
   set external(value) {
      this.#chat.external = value || undefined;
   };

   isCorrect() {
      // Verifica proprietà:
      if(this.#chat.owner === undefined || this.#chat.owner.length < 2)
         throw this.invalid_property;
   };
   new(title, external = false) {
      // Controlla parametri obbligatori:
      if(title === undefined || title.length === 0)
         throw this.invalid_property;

      // Inizializza documento (da usare anche per il riutilizzo dell'istanza della classe):
      this.#chat = {};
      this.#chat.type = "chat";
      this.#chat.title = title;
      this.#chat.external = external;
      this.#chat.locked = false;
      this.#chat.created_at = new Date().toISOString();
   };
   async load(id) {
      // Inizializza proprietà locali:
      let documents = [];

      // Verifica chiave del documento:
      if(id === undefined || id === 0)
         throw this.invalid_property;

      // Legge dalla collezione il documento:
      documents = await super._load("chats", {"_id": id});

      // Valorizza proprietà privata:
      this.#chat = documents[0];
   };
   async save() {
      // Controlla proprietà:
      this.isCorrect();

      // Genera identificativo da assegna alla chiave del documento:
      if(this.#chat._id === undefined)
         this.#chat._id = await super._getIntervalNextNumber("chats");
      else
         this.#chat.changed_at = new Date().toISOString();

      // Registra documento:
      await super._save("chats", this.#chat._id, this.#chat);
   };
   addOwner(email) {
      // Aggiunge partecipante alla chat:
      if(this.#chat.owner === undefined)
         this.#chat.owner = [];
      this.#chat.owner.push(email);
   };
   add(email, content) {
      // L'indirizzo email è presente nella chat?
      if(this.#chat.owner.indexOf(email) === -1)
         throw this.invalid_property;
      if(content === undefined || content.length === 0)
         throw this.invalid_property;

      // Aggiunge messaggio alla chat:
      if(this.#chat.messages === undefined)
         this.#chat.messages = [];
      this.#chat.messages.push({
         "owner": email,
         "content": content,
         "created_at": new Date().toISOString()
      });

      // Aggiunge notifica di lettura:
      this.addNotif(email);
   };
   addNotif(email) {
      // Nel documento viene inserito nell'array notif l'indirizzo della e-mail in modo da indicare
      // che è presente un messaggio da leggere_
      this.#chat.owner.forEach(notif => {
         if(this.#chat.notif === undefined)
            this.#chat.notif = [];
         if(notif !== email && this.#chat.notif.indexOf(notif) === -1)
            this.#chat.notif.push(notif);
      });
   };
   delNotif(email) {
      // Inizializza proprietà locali:
      let index = -1;

      // Elimina la notifica per l'indirizzo e-mail del partecipante:
      if(this.#chat.notif !== undefined) {
         index = this.#chat.notif.indexOf(email);
         if(index !== -1)
            this.#chat.notif.splice(index, 1);
      }
   };
}

/*&==================================================================================================================*
 *& Esporta modulo
 *&=================================================================================================================*/
module.exports = Chat;
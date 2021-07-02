const express = require("express");
const Chat = require("../libraries/Chat");
const User = require("../libraries/User");

const config = require("../public/config.json").database;

const router = express.Router();

/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
router.get("/", async(request, response) => {
   // Inizializza proprietà locali:
   let chat = undefined;
   let documents = [];
   let data = [];

   // Prepara elenco delle chat da visualizzare:
   try {
      chat = new Chat();
      await chat.open(config.dbname, config.address, config.port);
      documents = await chat.find({ "type": "chat" });

      // Chat usata per permetterne la creazione di una nuova:
      data.push({
         "_id": "new",
         "title": "Nuova chat",
         "body": "Permette la creazione di una nuova chat",
         "locked": false,
         "external": false,
         "new": true
      });

      // Chat disponibili:
      documents.forEach(record => {
            data.push({
               "_id": record._id,
               "title": record.title.substr(0, 15),
               "body": record.messages[0].content.substr(0, 59),
               "locked": record.locked,
               "external": record.external,
               "new": false
            });
         });
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await chat.close();
      chat = undefined;
   }

   // Render della pagina della chat:
   response.render("chat/entry", {
      "title": "Comunicazioni",
      "data": data
   });
});
router.get("/new", async(request, response) => {
   // Inizializza proprietà locali:
   let user = undefined;
   let documents = [];
   let address = [];

   // Legge gli indirizzi e-mail in modo da popolare la combo:
   try {
      user = new User();
      await user.open(config.dbname, config.address, config.port);
      if(request.session.userdata === undefined)
         documents = await user.find({ "type": "user", "locked": false });
      else
         documents = await user.find({
            "type": "user",
            "locked": false,
            "_id": {
               $ne: request.session.userdata.email
            }
         });

      // Prepara array degli indirizzi e-mail disponibili:
      documents.forEach(record => {
         address.push({ "email": record._id });
      });
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await user.close();
      user = undefined;
   }

   // Render della pagina per l'inserimento di una nuova chat:
   response.render("chat/new", {
      "title": "Nuova comunicazione",
      "address": address
   });
});
router.post("/new", async(request, response) => {
   // Inizializza proprietò locali:
   let chat = undefined;

   // Permette d'inserire una nuova chat:
   try {
      chat = new Chat();
      await chat.open(config.dbname, config.address, config.port);
      chat.new(request.body.title);
      chat.addOwner(request.session.userdata.email);
      chat.addOwner(request.body.email);
      chat.add(request.session.userdata.email, request.body.data);
      await chat.save();
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await chat.close();
      chat = undefined;
   }

   // Redirect della pagina della chat:
   response.redirect("/chat");
});

/*&==================================================================================================================*
 *& Esporta modulo
 *&=================================================================================================================*/
module.exports = router;
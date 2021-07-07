/* -------------------------------------------------------------------------------------------------+
* | Description:
* +------------------------------------------------------------------------------------------------*/
document.querySelector("#next").addEventListener("click", (event) => {
   // Inizializza proprietà locali:
   let who = document.querySelector("#who");

   // L'utente ha selezionato una risposta?
   if(who.selectedIndex < 2)
      who.classList.add("is-invalid");
   else {
      who.classList.remove("is-invalid");
      document.querySelector("#submit").submit();
   }
});
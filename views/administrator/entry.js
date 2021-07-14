/* -------------------------------------------------------------------------------------------------+
* | Description:
* +------------------------------------------------------------------------------------------------*/
document.querySelector("#btn-group").addEventListener("change", (event) => {
   // Imposta quale voce è stata scelta:
   document.querySelector("#_id").value = event.target.id;

   // Permette di aggiornare pagina con le info selezionate:
   document.querySelector("#submit").submit();
});
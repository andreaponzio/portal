/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
document.querySelector("#fastReply").addEventListener("show.bs.modal", event => {
   // Assegna identificativo della chat:
   document.querySelector("#_id").value = event.relatedTarget.id;
});
document.querySelector("#next").addEventListener("click", event => {
   // Inizializza proprietà locali:
   let data = document.querySelector("#data");

   // Controlla la presenza della risposta:
   if(data.value.length === 0)
      data.classList.add("is-invalid");
   else {
      data.classList.remove("is-invalid");
      document.querySelector("#submit").submit();
   }
});
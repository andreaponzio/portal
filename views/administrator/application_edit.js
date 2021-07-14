/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
document.querySelector("#next").addEventListener("click", (event) => {
   // Inizializza proprietà locali:
   let id = document.querySelector("#_id");
   let id_feedback = document.querySelector("#_id_feedback");
   let title = document.querySelector("#title");
   let description = document.querySelector("#description");
   let sortid = document.querySelector("#sortid");
   let error = 0;

   // Controlla l'esistenza di un identificativo:
   if(id.value === "") {
      id_feedback.textContent = "E' necessario inserire un identificativo per l'applicazione";
      id.classList.add("is-invalid");
      error++;
   }
   else
      id.classList.remove("is-invalid");

   // Verifica la presenza di un titolo:
   if(title.value.length === 0) {
      title.classList.add("is-invalid");
      error++;
   }
   else
      title.classList.remove("is-invalid");

   // Verifica la presenza di una descrizione:
   if(description.value.length === 0) {
      description.classList.add("is-invalid");
      error++;
   }
   else
      description.classList.remove("is-invalid");

   // Verifica coerenza valore di ordinamento:
   if(parseInt(sortid.value) < 0 || parseInt(sortid.value) > 999) {
      sortid.classList.add("is-invalid");
      error++;
   }
   else
      sortid.classList.remove("is-invalid");

   // Procede al POST:
   if(!error) {
      document.querySelector("#_new").value = !id.readOnly;
      document.querySelector("#_locked").value = document.querySelector("#locked").value;
      document.querySelector("#submit").submit();
   }
});

/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
document.querySelector("#remove").addEventListener("click", (event) => {
   // Permette l'eliminazione di un'applicazione:
   document.querySelector("#_method").value = "DELETE";
   document.querySelector("#submit").submit();
});
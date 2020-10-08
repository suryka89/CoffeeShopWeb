
/* 
    Author     : Karol Fonseca Arguedas
*/


//Objeto control de la página
const control = new ControllerOrdenes('ControllerOrdenes');

$(document).ready(function () { //cargada la página
    //cargo las ordenes
    control.executeCargarOrdenes();

    //defino el método que invoca el Modal1
    this.executeMostrarModal1 = function (itemOrdenId) {
        control.executeMostrarModal1(itemOrdenId);
    };

    //defino el método que invoca el Modal2
    this.executeMostrarModal2 = function (itemOrdenId) {
        control.executeMostrarModal2(itemOrdenId);
    };

    //defino el método que actualiza mi página en caso que otro cliente actualice una orden
    setInterval(function () {
        control.executeValidarCambioEstado();
    }, 1000);
    
    //defino el método que redirecciona al login
    $("#btnLogin").click(function () {
        $(location).attr('href', 'login.html');
    });

});

$(function () {
    //defino la accion de arrastre en cada columna de estados de ordenes
    $("#sortable1, #sortable2, #sortable3, #sortable4").sortable({
        connectWith: ".connectedSortable",
        receive: function (event, ui) {
            //console.log("dropped on = " + this.id); // Dónde se deja caer el artículo
            //console.log("sender = " + ui.sender[0].id); // De donde vino
            //console.log("item = " + ui.item[0].id); //Qué item es
            control.executeProcesarCambioEstado(this.id, ui.sender[0].id, ui.item[0].id);
        }
    }).disableSelection();
});
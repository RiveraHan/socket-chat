const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utils/ultilidades');

const usuarios = new Usuarios();

io.on('connection', (client) => {


    client.on('entrarChat', (data, callback) => {

        if (!data.nombre || !data.sala) {
            return callback({
                error: true,
                mensaje: 'El nombre o la sala es necesaria'
            });
        }
        // Sintaxis para unirlo a una sala
        client.join(data.sala);

        const personas = usuarios.agregarPersona(client.id, data.nombre, data.sala);

        client.to(data.sala).emit('listaPersona', usuarios.getPersonasPorSala(data.sala));

        return callback(usuarios.getPersonasPorSala(data.sala));
    });

    client.on('crearMensaje', (data) => {

        const persona = usuarios.getPersona(client.id);

        const mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);
    });

    client.on('disconnect', () => {

        const personaBorrada = usuarios.borrarPersona(client.id);

        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Adminitrador', `${ personaBorrada.nombre } salió`));
        client.broadcast.to(personaBorrada.sala).emit('listaPersona', usuarios.getPersonasPorSala(personaBorrada.sala));
    });

    // Mensajes privados
    client.on('mensajePrivado', (data, callback) => {

        // if (!data) {
        //     return callback({
        //         error: true,
        //         mensaje: 'El nombre es necesario'
        //     });
        // }


        const persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));

        // return callback(persona);

    });

});
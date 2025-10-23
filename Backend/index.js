//Creando servidor en express
const express = require('express');
const cuentas_data = require ('./data')
const app = express();
const PORT = 3130

app.use(express.json());

app.listen(PORT,() =>{
    console.log(`Servidor corriendo en http://localhost:${PORT} `)
});

//Endpoint solicitado Uno.
app.get('/cuentas', (req, res) => {
    //Calculando el total de cuentaaas
    const total = cuentas_data.length;

    //Lo que busco mostrar
    res.json({
        total,
        cuentas: cuentas_data
    });
});

//Endpoint solictado Dos
app.get('/cuenta/:id', (req, res)=>{
    const {id} = req.params;
    const cuenta = cuentas_data.find(x => String(x._id) === id);

    if(!cuenta){
        return res.status(404).json({message: `Esta cuenta con el id ${id} no está registrada en nuestros servicios:`})
    }
    else{
        return res.status(200).json({message: `Esta cuenta con el id ${id} está registrada. A continuación, el detalle:`, cuenta})
    }
})

//Tercer endpoint
app.get('/cuentas/buscar', (req, res) => {
    const { queryParam } = req.query;

    if (!queryParam) {
        return res.status(400).json({ message: "Ingrese un parámetro por favor" });
    }

    
    let paramValue =
        queryParam.toLowerCase() === 'true' ? true :
        queryParam.toLowerCase() === 'false' ? false :
        queryParam.toLowerCase();

    // funcioooon, esta la tuve que buscar
    const normalize = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    const busqueda = cuentas_data.filter(cuenta => {
        if (typeof paramValue === 'boolean') {
            return cuenta.isActive === paramValue;
        }

        const val = normalize(paramValue);
        return (
            normalize(String(cuenta._id)).includes(val) ||
            normalize(String(cuenta.balance)).includes(val) ||
            (cuenta.client && normalize(cuenta.client).includes(val)) ||
            (cuenta.gender && normalize(cuenta.gender).includes(val))
        );
    });

    if (busqueda.length === 0) {
        return res.json({
            finded: false,
            message: "No hay ninguna coincidencia según su solicitud"
        });
    }

    if (busqueda.length === 1) {
        return res.json({
            finded: true,
            account: busqueda[0]
        });
    }

    res.json({
        finded: true,
        cuentas_data: busqueda
    });
});

// Endpoint para sumar todos los balances
app.get('/cuentas/totalBalance', (req, res) => {
    const totalBalance = cuentas_data.reduce(
        (sum, cuenta) => sum + parseFloat(cuenta.balance.replace('$','').replace(/,/g,'')),
        0
    );

    if(totalBalance === 0){
        return res.status(404).json({ message: "No hay balances a sumar" });
    }

    return res.status(200).json({ totalBalance });
});

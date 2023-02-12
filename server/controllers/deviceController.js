const ApiError = require('../error/apiError')
const uuid = require('uuid')
const path = require('path')
const {Device, Brand} = require('../models/models')
const {DeviceInfo} = require('../models/models')


class DeviceController{

    async create(req, res, next){
        try{
            const {name, price, brandId, typeId, info} = req.body
            const {img} = req.files
            const fileName =name + " " + uuid.v4() + ".jpg"
            img.mv(path.resolve(__dirname, '..', 'static',fileName))

            const device = await Device.create({
                name, price, brandId, typeId, img:fileName
            })
            
            if (info.length>0){
                const infos = JSON.parse(info)
                console.log('DeviceController create info', infos)
                infos.forEach(item => {
                    DeviceInfo.create({
                        title: item.title,
                        description: item.description,
                        deviceId: device.id
                    })
                });
            }
            return res.json(device)
        }catch(e){
            next(ApiError.badRequest(`DeviceController ${e.message}`))
        }
    }

    async getAll(req,res, next){
        try{
            let {brandId, typeId, page, limit} = req.query
            page = page || 1 
            limit = limit || 9
            const offset = limit * page - limit
           
            let devices
            if(!brandId && !typeId) 
                devices = await Device.findAndCountAll({offset, limit,include:[{model:Brand}]})

            if (!brandId && typeId) 
                devices = await Device.findAndCountAll({where : {typeId},limit, offset, include:[{model:Brand}] })

            if (brandId && !typeId) 
                devices = await Device.findAndCountAll({where:{brandId},limit,offset, include:[{model:Brand}]})

            if (brandId && typeId) 
                devices = await Device.findAndCountAll({where:{brandId, typeId}.limit,offset, include:[{model:Brand}]})
            return res.json(devices)
        }
        catch(e){
            next(ApiError().badRequest('DeviceController getAll',e.message()))
        }
    }
 
    async getOne(req,res){
        const {id} = req.params
        const device = await Device.findOne({
            where:{id},
            include:[{model: DeviceInfo, as: 'info'}]
        })

        return res.json(device)
    }

}

module.exports = new DeviceController()
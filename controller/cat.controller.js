const catModel = require('../model/cat.model');


class catController {
    async createCat(req, res) {
        try {
            const { name, PId } = req.body;
            const newCat = await catModel.create({ name, PId });
            return res.status(201).json({ message: 'Cat created successfully', data: newCat });
        } catch (error) {
            return res.status(500).json({ message: 'Error creating cat', error });
        }
    }

    async getAllCats(req, res) {
        try {
            const cats = await catModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $eq: ['$PId', null]
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'cats',
                        let: { parentId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$PId', '$$parentId']
                                    }
                                }
                            },
                            {
                                $project:{
                                    name: 1,
                                    _id: 1
                                }
                            },
                            {
                                $lookup: {
                                    from: 'cats',
                                    let: { childId: '$_id' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ['$PId', '$$childId']
                                                }
                                            }
                                        },
                                        {
                                            $project: {
                                                name: 1,
                                                _id: 1
                                            }
                                        }
                                    ],
                                    as: 'childCat'
                                }
                            }
                        ],
                        as: 'parentCat'
                    }
                },
                {
                    $project:{
                        name: 1,
                        parentCat: '$parentCat' ,
                        childCat: '$childCat'
                    }
                }
            ]);
            return res.status(200).json({ message: 'Cats retrieved successfully', data: cats });
        } catch (error) {
            return res.status(500).json({ message: 'Error retrieving cats', error });
        }
    }
}

module.exports = new catController();
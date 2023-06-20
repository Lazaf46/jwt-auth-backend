exports.getSecretData = (req, res, next) => {
    return res.status(200).json({
        status: 'success',
        message: 'you can view your secret data',
        data: {
            secret: 'Devops is awesome'
        }
    });
};

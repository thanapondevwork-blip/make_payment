const cloudinary = require("../config/cloudinary");

exports.uploadSlip = async (filePath, publicId) => {
  const option = {
    unique_filename: false,
    use_filename: true,
    overwrite: true,
    folder: "/make_payment",
  };

  if (publicId) {
    option.public_id = publicId;
  }

  const result = await cloudinary.uploader.upload(filePath, option);
  //   console.log(result, "result");
  return result.secure_url;
};

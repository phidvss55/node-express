import * as mongoose from 'mongoose';
import Address from '../interfaces/address.interface';

const addressSchema = new mongoose.Schema({
  city: {
    type: String,
  },
  street: String,
});

const AddressModel = mongoose.model<Address & mongoose.Document>('Address', addressSchema);

export default AddressModel;

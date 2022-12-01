import { getModelForClass, prop } from '@typegoose/typegoose';

export class Options {
    @prop({ required: true })
    public optionId: number;
    @prop({ required: true })
    public prompt: string;
}

export class Option {
    @prop({ required: true })
    public voteId: number;
    @prop({ type: () => Options, required: true })
    public options: Options[];
}

const OptionModel = getModelForClass(Option);

export default OptionModel;

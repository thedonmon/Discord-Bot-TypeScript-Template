import { AutoIncrementSimple } from '@typegoose/auto-increment';
import {
    DocumentType,
    getModelForClass,
    plugin,
    prop,
    ReturnModelType,
} from '@typegoose/typegoose';
import { LeanDocument } from 'mongoose';

export class Options {
    @prop({ required: true })
    public optionId: number;
    @prop({ required: true })
    public prompt: string;
}

@plugin(AutoIncrementSimple, [{ field: 'voteId' }])
export class Vote {
    @prop()
    public voteId: number;
    @prop({ required: true })
    public creatorId: number;
    @prop({ required: true })
    public question: string;
    @prop({ required: false })
    public votelimit?: number;
    @prop({ required: true })
    public guildId: number;
    @prop({ required: true })
    public channelId: number;
    @prop()
    public pollstage?: number;
    @prop()
    public type?: number;
    @prop({ default: 0 })
    public numwinners?: number;
    @prop({ default: 0 })
    public numvotes?: number;
    @prop({ default: 0 })
    public closetime?: number;
    @prop({ default: Date.now() })
    public creationdate?: Date;
    @prop({ type: () => Options, required: true })
    public options: Options[];
    @prop()
    public is_closed: boolean;

    public async updateQuestion(this: DocumentType<Vote>, question: string): Promise<void> {
        this.question = question;
        await this.save();
    }

    public static async closePoll(
        this: ReturnModelType<typeof VoteModel>,
        voteId: number
    ): Promise<void> {
        const doc = await this.findOne({ voteId }).exec();
        doc.is_closed = true;
        await doc.save();
    }

    public static async getPoll(
        this: ReturnModelType<typeof VoteModel>,
        voteId: number
    ): Promise<DocumentType<Vote>> {
        return await this.findOne({ voteId }).exec();
    }

    public static async getPollByStage(
        this: ReturnModelType<typeof VoteModel>,
        voteId: number,
        stage: number
    ): Promise<LeanDocument<Vote>> {
        const doc = await this.findById({ voteId, pollstage: { $gte: stage } }).exec();
        const docObj = doc.toObject();
        return docObj;
    }

    public static async getOptions(
        this: ReturnModelType<typeof VoteModel>,
        voteId: number
    ): Promise<Options[]> {
        const doc = await this.findOne({ voteId }).exec();
        if (doc) {
            return doc.options;
        }
        return [new Options()];
    }

    public static async updateStage(
        this: ReturnModelType<typeof VoteModel>,
        voteId: number,
        stage: number
    ): Promise<LeanDocument<Vote>> {
        const doc = await this.findOne({ voteId }).exec();
        if (doc) {
            doc.pollstage = stage;
            await doc.save();
            const docObj = doc.toObject();
            return docObj;
        }
        return null;
    }
}

const VoteModel = getModelForClass(Vote);

export default VoteModel;

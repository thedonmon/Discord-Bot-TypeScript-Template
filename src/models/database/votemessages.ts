import { AutoIncrementSimple } from '@typegoose/auto-increment';
import { getModelForClass, plugin, prop, ReturnModelType } from '@typegoose/typegoose';

@plugin(AutoIncrementSimple, [{ field: 'messageId' }])
export class VoteMessages {
    @prop({ required: true })
    public voteId: number;
    @prop()
    public messageId: number;
    @prop()
    public part?: string;

    public static async getVoteMessagesByVoteId(
        this: ReturnModelType<typeof VoteMessages>,
        voteId: number
    ): Promise<VoteMessages[]> {
        const doc = await this.find({ voteId }).exec();
        const docObj = doc.map(x => {
            return x.toObject();
        });
        return docObj;
    }

    public static async getVoteMessage(
        this: ReturnModelType<typeof VoteMessages>,
        messageId: number,
        voteId: number
    ): Promise<VoteMessages> {
        const doc = await this.findOne({ messageId, voteId }).exec();
        const docObj = doc.toObject();
        return docObj;
    }
}

const VoteMessageModel = getModelForClass(VoteMessages);

export default VoteMessageModel;

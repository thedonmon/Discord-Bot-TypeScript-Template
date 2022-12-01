import { getModelForClass, prop, ReturnModelType } from '@typegoose/typegoose';
import { LeanDocument } from 'mongoose';

export class UserVote {
    @prop({ required: true })
    public voteId: number;
    @prop({ required: true })
    public userId: number;
    @prop({ required: true })
    public choice: number;
    @prop()
    public preference?: number;

    public static async getChoicesByVoteIdUserId(
        this: ReturnModelType<typeof UserVoteModel>,
        voteId: number,
        userId: number
    ): Promise<LeanDocument<UserVote[]>> {
        const docs = await this.find({ voteId, userId }).exec();
        return docs.map(x => x.toObject());
    }

    public static async getChoicesByVoteId(
        this: ReturnModelType<typeof UserVoteModel>,
        voteId: number
    ): Promise<LeanDocument<UserVote[]>> {
        const docs = await this.find({ voteId }).exec();
        return docs.map(x => x.toObject());
    }

    public static async getChoicesByVoteIdUserIdOrdered(
        this: ReturnModelType<typeof UserVoteModel>,
        voteId: number,
        userId: number,
        direction: 'asc' | 'desc'
    ): Promise<LeanDocument<UserVote[]>> {
        const numDirection = direction === 'asc' ? 1 : -1;
        const docs = await this.find({ voteId, userId })
            .sort({ choice: numDirection, preference: numDirection })
            .exec();
        return docs.map(x => x.toObject());
    }

    public static async getChoicesByVoteIdOrderedWithUserId(
        this: ReturnModelType<typeof UserVoteModel>,
        voteId: number,
        direction: 'asc' | 'desc'
    ): Promise<LeanDocument<UserVote[]>> {
        const numDirection = direction === 'asc' ? 1 : -1;
        const docs = await this.find({ voteId })
            .sort({ userId: numDirection, choice: numDirection, preference: numDirection })
            .exec();
        return docs.map(x => x.toObject());
    }
}

const UserVoteModel = getModelForClass(UserVote);

export default UserVoteModel;

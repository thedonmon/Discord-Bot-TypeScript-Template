import { Guild, TextChannel, User } from 'discord.js';
import { Connection } from 'mongoose';

import { getDB } from '../db_pool/mongo.js';
import UserVoteModel, { UserVote } from '../models/database/uservote.js';
import VoteMessageModel from '../models/database/votemessages.js';
import VoteModel, { Vote } from '../models/database/votes.js';

export class VotingService {
    private db: Connection;
    constructor() {
        this.db = getDB().db;
    }

    public async addVote(
        creator: User,
        question: string,
        options: string[],
        limit: number,
        guild: Guild,
        channel: TextChannel,
        stage: number = 0,
        type: number = 1,
        num_winners: number = 1,
        title_pre: string = 'Poll'
    ): Promise<{ voteId: number; title: string }> {
        const optionsToAdd = options.map((option, index) => {
            return {
                optionId: index + 1,
                prompt: option,
            };
        });
        const doc = await VoteModel.create({
            creator: Number(creator.id),
            question,
            options: optionsToAdd,
            votelimit: limit,
            guildId: Number(guild.id),
            channelId: Number(channel.id),
            pollstage: stage,
            type,
            numwinners: num_winners,
        });
        const title = `${title_pre} ${doc.voteId}: ${question}`;
        await doc.updateQuestion(title);
        return {
            voteId: doc.voteId,
            title,
        };
    }

    public async removeVote(voteId: number): Promise<void> {
        await VoteModel.closePoll(voteId);
    }

    public async getVote(voteId: number): Promise<Vote> {
        const doc = await VoteModel.getPoll(voteId);
        return await doc?.toObject();
    }

    public async addMessage(voteId: number, messageId: number, part?: number): Promise<void> {
        await VoteMessageModel.create({
            voteId,
            messageId,
            part,
        });
    }

    public async getMessages(
        voteId?: number
    ): Promise<{ messageId: number; guildId: number; channelId: number }[]> {
        if (voteId) {
            const docs = await VoteMessageModel.getVoteMessagesByVoteId(voteId);
            const poll = await VoteModel.getPollByStage(voteId, -1);
            const messages = docs.map(doc => {
                return {
                    messageId: doc.messageId,
                    guildId: poll.guildId,
                    channelId: poll.channelId,
                };
            });
            return messages;
        }
    }

    public async updateStage(voteId: number, stage: number): Promise<void> {
        await VoteModel.updateStage(voteId, stage);
    }

    public async getOptions(voteId: number): Promise<{ optionId: number; prompt: string }[]> {
        const doc = await VoteModel.getOptions(voteId);
        return doc;
    }

    public async addUserVote(
        voteId: number,
        userId: number,
        choice: number,
        pref: number
    ): Promise<void> {
        await UserVoteModel.create({
            voteId,
            userId,
            choice,
            preference: pref,
        });
    }

    public async removeUserVote(
        voteId: number,
        userId: number,
        choice?: number
    ): Promise<number[]> {
        if (choice) {
            await UserVoteModel.deleteMany({ voteId, userId, choice }).exec();
            return [];
        } else {
            const choices = await UserVoteModel.getChoicesByVoteIdUserId(voteId, userId);
            await UserVoteModel.deleteMany({ voteId, userId }).exec();
            return choices.map(x => x.choice);
        }
    }

    public async getUserVotes(voteId: number, userId?: number): Promise<UserVote[]> {
        if (userId) {
            const choices = await UserVoteModel.getChoicesByVoteIdUserIdOrdered(
                voteId,
                userId,
                'asc'
            );
            return choices;
        }
        const choices = await UserVoteModel.getChoicesByVoteIdOrderedWithUserId(voteId, 'asc');
        return choices;
    }

    public async getUserVoteCount(
        voteId: number,
        choice?: number,
        userId?: number
    ): Promise<number | { optionId: number; prompt: string; count: number }[]> {
        if (!choice) {
            if (!userId) {
                const vote = await VoteModel.getPoll(voteId);
                const all_user_votes_by_vote_id = await UserVoteModel.getChoicesByVoteId(voteId);
                const voteOptions = vote.options;
                const final_result = [];
                for (const opt of voteOptions) {
                    const votes = all_user_votes_by_vote_id.filter(x => x.choice === opt.optionId);
                    const reGroup = (list: any, key: string): { items: any[]; key: string }[] => {
                        const groups = [];
                        list.forEach(item => {
                            let groupIndex = groups.findIndex(gi => gi.key === item[key]);
                            if (groupIndex === -1) {
                                // when the group containing object does not exist in the array,
                                // create it
                                groups.push({ key: item[key], items: [] });
                                groupIndex = groups.length - 1;
                            }
                            const newItem = Object.assign({}, item);
                            groups[groupIndex].items.push(newItem);
                        });
                        return groups;
                    };
                    const optionsGrouped = reGroup(votes, 'choice');
                    final_result.push({
                        optionId: opt.optionId,
                        prompt: opt.prompt,
                        count: optionsGrouped[0].items.length,
                    });
                }
                return final_result.sort((a, b) => b.count - a.count);
            } else {
                const uservote_by_choice_count = await UserVoteModel.countDocuments({
                    voteId,
                    userId: userId,
                }).exec();
                return uservote_by_choice_count;
            }
        } else {
            if (!userId) {
                const uservote_by_choice_count = await UserVoteModel.countDocuments({
                    voteId,
                    choiceId: choice,
                }).exec();
                return uservote_by_choice_count;
            } else {
                const uservote_by_choice_count = await UserVoteModel.countDocuments({
                    voteId,
                    choiceId: choice,
                    userId: userId,
                }).exec();
                return uservote_by_choice_count;
            }
        }
    }
}

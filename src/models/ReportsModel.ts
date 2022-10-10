import { Schema, Mongoose, Model } from 'mongoose';

export interface IReport {
    _id: string;
    averageTweetsPerDayOverall: number;
    averageTweetsPerDayActiveDays: number;
    maxTweetsPerDay: number;
    probablyPlannedPostsCount: number;
    followersCount: number;
    followingCount: number;
    tweetsCount: number;
    tweets: { id: string; text: string; created_at: string }[];
    lastScanAt: Date;
}

export interface IReportsStatistics {
    averageTweetsPerDayOverall: number;
    averageTweetsPerDayActiveDays: number;
    maxTweetsPerDay: number;
    probablyPlannedPostsCount: number;
    followersCount: number;
    followingCount: number;
    tweetsCount: number;
}

export default class ReportsModel {
    private readonly _ReportModel: Model<IReport>;

    public constructor( driver: Mongoose ) {
        const reportsSchema: Schema = new driver.Schema( {
            _id: {
                type: String,
                unique: true,
                index: true,
                require: true
            },
            averageTweetsPerDayOverall: Number,
            averageTweetsPerDayActiveDays: Number,
            maxTweetsPerDay: Number,
            probablyPlannedPostsCount: Number,
            followersCount: Number,
            followingCount: Number,
            tweetsCount: Number,
            tweets: [ { id: String, text: String, created_at: String } ],
            lastScanAt: Date
        } );

        this._ReportModel = driver.model<IReport>( 'Report', reportsSchema );
    }

    public get queryable(): Model<IReport> {
        return this._ReportModel;
    }

    public async save( username: string, data: Partial<IReport> ): Promise<void> {
        await this._ReportModel.updateOne( { _id: username }, { ...data }, { upsert: true } );
    }

    public async findByUsername( username: string ): Promise<IReport | null> {
        return this._ReportModel.findOne( { _id: username } );
    }

    public async count(): Promise<number> {
        return this._ReportModel.countDocuments();
    }

    public async getStatistics(): Promise<IReportsStatistics> {
        const [ statistics ] = await this._ReportModel.aggregate<IReportsStatistics>(
            [
                {
                    $group:
                    {
                        _id: null,
                        averageTweetsPerDayOverall: { $avg: "$averageTweetsPerDayOverall" },
                        averageTweetsPerDayActiveDays: { $avg: "$averageTweetsPerDayActiveDays" },
                        maxTweetsPerDay: { $avg: "$maxTweetsPerDay" },
                        probablyPlannedPostsCount: { $avg: "$probablyPlannedPostsCount" },
                        followersCount: { $avg: "$followersCount" },
                        followingCount: { $avg: "$followingCount" },
                        tweetsCount: { $avg: "$tweetsCount" }
                    }
                }
            ]
        )

        return statistics;
    }
}

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
    followers: string[];
    following: string[];
    lastScanAt: Date;
    dataset: string;
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
            followers: [ { type: String } ],
            following: [ { type: String } ],
            lastScanAt: Date,
            dataset: String
        } );

        this._ReportModel = driver.model<IReport>( 'Report', reportsSchema );
    }

    public async save( username: string, data: Partial<IReport> ): Promise<void> {
        await this._ReportModel.updateOne( { _id: username }, { ...data }, { upsert: true } );
    }

    public async findByUsername( username: string ): Promise<IReport | null> {
        return this._ReportModel.findOne( { _id: username } );
    }

    public async getDatasetContent( dataset: string ): Promise<IReport[]> {
        return this._ReportModel.find( { dataset } );
    }

    public async count(): Promise<number> {
        return this._ReportModel.countDocuments();
    }

    public async getDatasets(): Promise<string[]> {
        return this._ReportModel.distinct( 'dataset' );
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

        return statistics ?? {
            averageTweetsPerDayOverall: 0,
            averageTweetsPerDayActiveDays: 0,
            maxTweetsPerDay: 0,
            probablyPlannedPostsCount: 0,
            followersCount: 0,
            followingCount: 0,
            tweetsCount: 0
        };
    }
}

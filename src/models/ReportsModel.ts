import { Schema, Mongoose, Model, Document } from 'mongoose';

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

    public async save( data: Partial<IReport> ): Promise<void> {
        const report: Document = new this._ReportModel( data );

        await report.save();
    }
}

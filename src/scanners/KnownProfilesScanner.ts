import Scanner, { IScannerOutput, IScannerParams } from './base/Scanner';

const KNOWN_TROLL_PROFILES: string[] = [
    'Baczer', 'wilko_wedyn', 'audioclassa', 'mt252', 'Pawcio13721296', 'NoweAteny', 'LeszekSzostak62', 'Mandaryn62', 'justicepopolsku',
    'kanclerz', 'TomaszGryguc', 'kowalones', 'Beata01373973', 'Notabenefchuj', 'HanterPoen', 'NutkaBluesee2', 'xprzemo', 'DzPolityczny',
    'wkrawcz1', 'iwona_paulewicz', 'PanasiukPiotr', 'katrina1974pl', 'redakcjaxportal', 'coolfonpl', 'GolonkaWojciech', 'anonymous_mg76',
    'LOwianin', 'DeepLearningInfo', 'Gianna2411', 'my1884', 'Dominik51141857', 'SpokojnaDusza', 'darioo1379', 'Hamburg53093540',
    'Duke_Kristof', 'Feliks95417446', 'KcMarcin', 'RadekPiasecki1', 'RienNeVaPlus7', 'MikoTheJet', 'DemonDakki', 'Imperialista88',
    '_Rebeliant', 'JarosawK2', 'xiioan', 'DaniEla88108', 'RyszardM71', 'g_odne', 'NCopertnicus', 'MariuszZarycht1', 'EmTck_',
    'tomasz46464675', 'CombatWirus', 'Mariola38768960', 'RedneckRP', 'bogdan1409', 'Jurassx2', 'Pawluszka89', 'PoPrawnik2', 'bak_wanda',
    'YoshiYamamo_to', 'iwona_paulewicz', 'CzeslawJesiono6', 'KacapMSK', 'Laweta2', 'marian_konarski', 'SurkovAndrey', 'NikifPL',
    'Krzychu74706173', 'Magdale22740227', '4rmar', 'Seb_Lach', 'Margare54123149', 'MarianNajepka', 'MBalawelder', 'Pan_Roztropny',
    'news_slv', 'piotruchg', 'piotrzalanowski', 'SiepaczLewactwa', 'KNerwosol', 'LukRysiek', 'StopIslam10', 'teddy__candy', 'vicktop55',
    'wolnemediasilesia', 'olsztyn_online', 'bialystok_online', 'katowice_online', 'rzeszow_online', 'rzeszow_online', 'krakow_online',
    'meganPaprocka777', 'Anna_Tweeterowa', 'Spychacz2', 'ZajetoMojeNicki', 'entepe3', '21schilling', 'OjciecLski', 'hq777cheonsa',
    'pol_pilnujmy', 'argan_beekan', 'PNarodowe', 'JamesWa27363130', 'GoniecKrolewski', 'Vialityi', 'RCNKGdansk', 'Magdale22740227',
    'wilko_wedyn', 'olimpia_szuwar', 'duchpl', 'digi_jacek', 'leszek93', 'KSokolowska123', 'Boska_Polka', 'Backyardbadboy', 'OwUmys',
    'BartKurzeja', 'Borys45', 'Sir_WinstonCh', 'konrad_cybulski', 'BarW1984', 'rtygw', 'mrosiak55', 'jaokup', 'robertneska', 'ryszard_kawa',
    'Agata13820386', 'KrokodylG', 'LotEMarco1', 'byrcza', 'jakub_gajos', 'rafalhubert', 'KrzysztofMater2', 'masakra_i_witam', 'FoliarzWawa',
    'jasnastronamocyJSM', 'Aga34686913', 'Marzenk49281186', 'bob_gedron', '7MTLS', 'dictionaric', 'Polkaczterdzie1', 'PBeatap',
    'anty_lewiatan', 'Mrlollz1', 'miejskiziom', 'CrystalloverPL', 'Industrius', 'niebocentryzm', 'politykaUR', 'jan79349130',
    'CrisisConsulting', 'ARozbojnik', 'MIKO23452', 'MartaStruczews1', 'Edgarwolnosc', 'Artur89388437', 'AntMan7511', 'Angrystokrata',
    'cukierrro', 'Antysyst', 'piotruchg', 'ZbigniewSamczuk', 'Daniel51421132', 'annja27379938', 'Jarosla89455262', 'BigBearMarcin',
    'createimagic', 'Tadeuszkowalew8', 'MisioStary', 'darekmoab', 'WojciechW4', 'AptekaC', 'brussinf', 'pl_syrenka', 'balkanossiper',
    'SIL0VIKI', 'MedvedevVesti', 'SergeyKolyasnikov', 'pezdicide', 'mig41', 'hackberegini', 'chvkmedia', 'wingsofwar', 'omonmoscow',
    'go338', 'grey_zone', 'boris_rozhin', 'Krzysie50376279', 'Lucyna08305434', 'explorernews0', 'szcz67', 'MRebeliant', 'RStopikowski',
    'lady_north', 'sex_drugs_kahlo', 'KSokolowska123', 'usaperiodical', 'russ_orientalist', 'vladlentatarsky', 'rybar', 'milinfolive',
    'neoficialniybezsonov', 'marian_konarski', 'Michali49393358', 'Mitol_ns', 'Kris77Tany', 'WisiaSlav', 'KSisior', 'RussianInCracow',
    'MaciejMateus', 'DemonDakki', 'AbickiAwek', 'PartiaKresowian', 'CryptoD64437226', 'bogdan1409', 'uszinek', 'Albert301271', 'Cernovich',
    'MruczinoM', 'bozena_z58', 'Kazimie52609933', 'dimi_tygrys', 'Biay83318359', 'ewale21', 'Piotr42463680', 'Zometa17', 'ViolaNewYork',
    'SOFRONOW_', 'DzPolityczny', 'Horus543', 'Nesteruwp', 'obodryt', 'ufostar1', 'ZPunktu', 'PawelKo24827456', 'panasiukpiotr',
    'stanowczeniedlawojny', 'PitEsZetIgrek', 'JadwigaSokolow1', 'WiktoriaKrasno1', 'Selianski', 'Jretbdamcziypd1', 'info_narodowiec',
    'SputnikPolskaOfficial', 'CzeKuku', 'stranahan', 'CrystalloverPL', 'annagaranin', 'niezaleznatelewizja', 'michimalsa', 'gazetastonoga',
    'MBalawelder', 'PiotrWiel', 'Boska96541976', 'ewa_insomnia', 'BerekPolski', 'MinistersAcosta', 'JSmigowski', 'AcostaInstytut',
    '_I_ukas', 'kazumidai'
];

export default class KnownProfiesScanner extends Scanner {
    protected readonly _scannedElement: string = 'Known profiles';

    public constructor() {
        super()
    }

    protected async _scan( { user }: IScannerParams ): Promise<IScannerOutput> {
        let value: string = '<p> The scanned profile is <strong>NOT listed</strong> on the NASK list.';

        const normalizedKnownProfiles: string[] = KNOWN_TROLL_PROFILES.map( profile => profile.toLowerCase() );

        if ( normalizedKnownProfiles.includes( user.username.toLowerCase() ) ) {
            value = '<p> The scanned profile is <strong>LISTED</strong> on the NASK list!'
        }

        return {
            value,
            explanation: `
                <p>
                    The scanned profile has been compared to the list of profiles
                    that have been reported for producing disinformation content.
                    The list has been prepared by NASK and can be found in the
                    <a href="https://web.archive.org/web/20220508053755/https://www.nask.pl/pl/wlaczweryfikacje/wlaczweryfikacje/4413,WlaczWeryfikacje.html" target="_blank">Web Archive</a>.
                <p>
            `
        };
    }
}
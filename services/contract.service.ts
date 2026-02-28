// services/PHService.ts
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import {
  getTrackByContract,
  startTrack,
  updateContract,
  updateTrack,
} from './event.service';
import { getUserNotification, getUserByHeroId } from './user.service';
import { getHeroNotification } from './hero.service';
import { HOUR_EARLIER } from '@/constants/Constants';

// ──────────────────────────────────────────────────────────────
// BACKGROUND TASK — This runs even when app is KILLED
// ──────────────────────────────────────────────────────────────
const BACKGROUND_TRACKING_TASK = 'phservice-background-tracking';

TaskManager.defineTask<{ locations: Location.LocationObject[] }>(
  BACKGROUND_TRACKING_TASK,
  async ({ data, error }) => {
    if (error) {
      console.error('[Background Task] Error:', error);
      return;
    }
    if (!data?.locations?.[0]) return;

    const location = data.locations[0];
    const { latitude, longitude } = location.coords;

    console.log('[Background GPS] Updated:', latitude, longitude);

    // OPTIONAL: You can directly call your API here if needed
    // await updateTrackFromBackground(trackId, latitude, longitude);
  }
);

export default class PHService {
  billingType: string;
  enums: { billingType: string[]; step: string[]; notification: any[] };
  contract: any;
  name: string;
  step: string;
  tracking: boolean = false;
  times: { start: Date | null; end: Date | null } = { start: null, end: null };
  trackHistory: { latitude: number; longitude: number }[] = [];
  trackTime: number = 60000; // 60 seconds
  interval: any = null;
  uid: string;
  id: string = '';
  trackId: string = '';
  timeToStart: number;
  user: any = null;
  token: string;
  updateButton: any[] = [];
  contracteeToken?: string;
  contractorToken?: string;
  contractee: any;
  contractor: any;
  trackeable: boolean = true;
  addresses: Map<string, any> = new Map();
  hero: boolean = true;
  event: any;
  startTrackStep: number = 1;
  endTrackStep: number = 2;
  heroUser: any = null;
  serviceStart: any;
  serviceEnd: any;
  TRACK_INTERVAL: number;

  constructor(event: any, contract: any, token: string) {
    this.event = event;
    this.contract = contract;
    this.name = contract.service;
    this.enums = {
      billingType: ['hour', '30 min', 'night', 'day', 'service'],
      step: ['requested', 'started', 'ended', 'paid', 'finalized'],
      notification: [
        { title: 'Start Service', body: 'You have a service starting soon' },
        { title: 'Service Started', body: 'Service started' },
        { title: 'Service finalized', body: 'The service was finalized now' },
        {
          title: 'Payment billed',
          body: `You earned $${contract.price} for this job.`,
        },
      ],
    };
    this.billingType = this.enums.billingType[0];
    this.step = contract.step || this.enums.step[0];
    this.uid = this.generateUid();
    this.timeToStart = HOUR_EARLIER * 60 * 60 * 1000;
    this.token = token;
    this.serviceStart = contract.serviceStart || null;
    this.serviceEnd = contract.serviceEnd || null;
    this.TRACK_INTERVAL = 15000;
  }


  private async requestLocationPermissions() {
    const { status: fg } = await Location.requestForegroundPermissionsAsync();
    if (fg !== 'granted') throw new Error('Foreground location permission denied');

    const { status: bg } = await Location.requestBackgroundPermissionsAsync();
    if (bg !== 'granted') throw new Error('Background location permission denied');
  }

  startTracking = async () => {
    if (this.tracking) return;

    try {
      await this.requestLocationPermissions();

      await Location.startLocationUpdatesAsync(BACKGROUND_TRACKING_TASK, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 30000,
        distanceInterval: 15,
        deferredUpdatesInterval: 10000,
        pausesUpdatesAutomatically: false,
        activityType: Location.ActivityType.OtherNavigation,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'PetHero - Tracking Active',
          notificationBody: 'Recording your route during pet service',
          notificationColor: '#0066FF',
        },
      });

      this.tracking = true;

      // Get first location
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const firstPoint = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      this.trackHistory = [firstPoint];

      // Save track in DB
      const inserted = await startTrack(this.getTrackObject(), this.token);
      if (inserted?._id) {
        this.trackId = inserted._id;
        this.trackHistory = Array.isArray(inserted.history)
          ? [...inserted.history]
          : this.trackHistory;
      }

      // Start live UI updates (foreground only)
      this.startLiveUpdates();

      console.log('Background + Live tracking started');
    } catch (err: any) {
      console.error('Failed to start tracking:', err.message);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Live updates for map UI (runs only when app is open)
  // ──────────────────────────────────────────────────────────────
  private startLiveUpdates() {
    if (this.interval) clearInterval(this.interval);

    this.interval = setInterval(async () => {
      if (!this.tracking) return;

      try {
        const loc = await Location.getCurrentPositionAsync({});
        const point = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };

        this.trackHistory.push(point);
        this.update(); // Refresh UI

        // Save to backend every 3 points (~45–90 sec)
        if (this.trackHistory.length % 3 === 0 && this.trackId) {
          await updateTrack(this.trackId, this.getTrackObject(), this.token);
        }
      } catch (err) {
        console.warn('Live location update failed:', err);
      }
    }, this.TRACK_INTERVAL);
  }


  endTracking = async () => {
    this.tracking = false;
    clearInterval(this.interval);

    try {
      await Location.stopLocationUpdatesAsync(BACKGROUND_TRACKING_TASK);
    } catch (err) {
      console.warn('Error stopping background task:', err);
    }

    if (this.trackId) {
      const finalTrack = this.getTrackObject();
      finalTrack.status = 'finalized';
      await updateTrack(this.trackId, finalTrack, this.token);
    }

    console.log('Tracking stopped and finalized');
  };


  setHero = (bool: boolean) => (this.hero = bool);
  addRoute = (address: any, type: string) => this.addresses.set(type, address);

  heroToken = async () => {
    this.contracteeToken = await getHeroNotification(this.contract.contractee);
  };

  userToken = async () => {
    this.contractorToken = await getUserNotification(this.contract.contractor);
  };

  setTimeToStart = (number: number) => (this.timeToStart = number * 60000);

  binding = (method: any) => {
    this.updateButton.push(method);
    this.update();
  };

  checkTime = (type: string = 'start') => {
    if (!this.contract?.date?.start) return false;
    const now = Date.now();
    const start = new Date(this.contract.date.start).getTime();
    const end = new Date(this.contract.date.end).getTime();
    const diff = type === 'end' ? Math.abs(end - now) : Math.abs(start - now);
    return diff <= this.timeToStart;
  };

  generateUid = () =>
    `${Math.floor(Math.random() * Math.pow(32, 4)).toString(32)}t${Math.floor(
      Math.random() * Math.pow(32, 4)
    ).toString(32)}`;

  setTrackeable = (value: boolean) => (this.trackeable = value);

  setContract = async (contract: any) => {
    this.contract = contract;
    this.step = contract.step;
    this.serviceStart = contract.serviceStart;
    this.serviceEnd = contract.serviceEnd;
    this.heroUser = await getUserByHeroId(this.contract.contractee);

    if (this.getStepValue() === this.startTrackStep && this.hero && this.contract?._id) {
      const track = await getTrackByContract(this.contract, this.token);
      if (!track) {
        await this.startTracking();
      } else {
        this.trackHistory = Array.isArray(track.history) ? [...track.history] : [];
        this.trackId = track._id;
        this.startLiveUpdates();
      }
    }
  };

  onStartService = async () => {
    if (!this.contract.serviceStart) {
      this.contract.serviceStart = new Date();
      await updateContract(this.contract._id, this.contract, this.token);
    }
    if (this.trackeable && !this.tracking && this.hero) {
      await this.startTracking();
    }
  };

  onEndService = async () => {
    if (!this.contract.serviceEnd) {
      this.contract.serviceEnd = new Date();
      await updateContract(this.contract._id, this.contract, this.token);
    }
    if (this.tracking) await this.endTracking();
  };

  getTrackObject = () => ({
    uid: this.uid,
    user: this.contract.contractor,
    contract: this.contract?._id,
    history: [...this.trackHistory],
    status: this.step,
  });

  setBillingType = (value: number) => (this.billingType = this.enums.billingType[value]);

  setStep = (value: number) => {
    this.step = this.enums.step[value];
    this.contract.step = this.step;
    this.update();
    return this.stepActions(this.step);
  };

  update = () => console.log('IMPLEMENT ON CHILD');

  stepActions = (index: string) => {
    const actions: any = {
      requested: () => this.tracking && this.onEndService(),
      started: () => !this.tracking && this.onStartService(),
      ended: () => this.tracking && this.onEndService(),
      paid: () => this.tracking && this.onEndService(),
    };
    return actions[index];
  };

  getStepValue = () => this.enums.step.indexOf(this.step);

  next = async () => {
    if (!this.contracteeToken) await this.heroToken();
    if (!this.contractorToken) await this.userToken();

    return new Promise(async (resolve, reject) => {
      try {
        const value = this.getStepValue();
        await this.sendNotification({
          ...this.enums.notification[value],
          expoToken: this.contracteeToken!,
        });
        await this.sendNotification({
          ...this.enums.notification[value],
          expoToken: this.contractorToken!,
        });

        this.setStep(value + 1);
        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
  };

  sendNotification = async (obj: { expoToken: string; title: string; body: string }) => {
    const message = { to: obj.expoToken, sound: 'default', title: obj.title, body: obj.body };
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  };
}
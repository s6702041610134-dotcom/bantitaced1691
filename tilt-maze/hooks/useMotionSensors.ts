import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { SensorFusionEngine } from '../engine/sensorFusion';
import { SensorReading, Vector2D } from '../engine/types';

interface MotionHookConfig {
  sensitivity: number;
  filterAlpha: number;
  calibratedOffset?: Vector2D;
}

export function useMotionSensors(config: MotionHookConfig) {
  const [isSensorAvailable, setIsSensorAvailable] = useState<boolean>(false);
  const [tilt, setTilt] = useState<Vector2D>({ x: 0, y: 0 });
  const [rawAccel, setRawAccel] = useState<SensorReading>({ x: 0, y: 0, z: 1 });
  const [rawGyro, setRawGyro] = useState<SensorReading>({ x: 0, y: 0, z: 0 });
  const [useVirtual, setUseVirtual] = useState<boolean>(false);

  const fusionEngineRef = useRef<SensorFusionEngine>(
    new SensorFusionEngine(config.filterAlpha)
  );

  const accelDataRef = useRef<SensorReading>({ x: 0, y: 0, z: 1 });
  const gyroDataRef = useRef<SensorReading>({ x: 0, y: 0, z: 0 });

  // Use a ref for virtualTilt so the animation loop always gets the latest value
  const virtualTiltRef = useRef<Vector2D>({ x: 0, y: 0 });
  const useVirtualRef = useRef<boolean>(false);

  // === FIX: Store the latest tilt in a ref for immediate access ===
  const tiltRef = useRef<Vector2D>({ x: 0, y: 0 });

  // === FIX: Throttle React state updates to reduce re-renders ===
  const renderThrottleRef = useRef<number>(0);

  const setVirtualTilt = useCallback((t: Vector2D) => {
    virtualTiltRef.current = t;
  }, []);

  const setUseVirtualAndRef = useCallback((val: boolean) => {
    useVirtualRef.current = val;
    setUseVirtual(val);
  }, []);

  // Update engine parameters when config changes
  useEffect(() => {
    fusionEngineRef.current.setAlpha(config.filterAlpha);
    if (config.calibratedOffset) {
      fusionEngineRef.current.setCalibrationOffset(config.calibratedOffset);
    }
  }, [config.filterAlpha, config.calibratedOffset]);

  // Check availability and register listeners
  useEffect(() => {
    let accelSub: any = null;
    let gyroSub: any = null;
    let isMounted = true;

    async function initSensors() {
      try {
        const accelAvail = await Accelerometer.isAvailableAsync();
        const gyroAvail = await Gyroscope.isAvailableAsync();

        if (isMounted) {
          const available = accelAvail && gyroAvail;
          setIsSensorAvailable(available);

          if (!available) {
            // No physical sensor — auto-enable virtual pad
            useVirtualRef.current = true;
            setUseVirtual(true);
          }
        }

        // Set update frequency to 16ms (~60Hz)
        Accelerometer.setUpdateInterval(16);
        Gyroscope.setUpdateInterval(16);

        accelSub = Accelerometer.addListener(data => {
          accelDataRef.current = data;
          if (isMounted) setRawAccel(data);
        });

        gyroSub = Gyroscope.addListener(data => {
          gyroDataRef.current = data;
          if (isMounted) setRawGyro(data);
        });
      } catch (e) {
        console.warn('Sensors not accessible, falling back to virtual mode:', e);
        if (isMounted) {
          setIsSensorAvailable(false);
          useVirtualRef.current = true;
          setUseVirtual(true);
        }
      }
    }

    initSensors();

    // 60FPS Fusion Loop — reads refs so it always has latest values
    let animFrame: number;
    const sensitivityRef = { current: config.sensitivity };
    sensitivityRef.current = config.sensitivity;

    function loop() {
      let newTilt: Vector2D;

      if (useVirtualRef.current) {
        newTilt = { ...virtualTiltRef.current };
      } else {
        newTilt = fusionEngineRef.current.update(
          accelDataRef.current,
          gyroDataRef.current,
          sensitivityRef.current
        );
      }

      // Always update the ref (instant, no re-render)
      tiltRef.current = newTilt;

      // === FIX: Throttle React state updates — only update every 2nd frame (~30fps) ===
      // This keeps physics smooth at 60fps while reducing React re-renders by 50%
      renderThrottleRef.current += 1;
      if (renderThrottleRef.current >= 2) {
        renderThrottleRef.current = 0;
        setTilt(newTilt);
      }

      animFrame = requestAnimationFrame(loop);
    }
    animFrame = requestAnimationFrame(loop);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animFrame);
      if (accelSub) accelSub.remove();
      if (gyroSub) gyroSub.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync sensitivity changes into the loop without restarting it
  useEffect(() => {
    // Re-run the loop closure captures will pick it up via the engine
    fusionEngineRef.current.setAlpha(config.filterAlpha);
  }, [config.sensitivity, config.filterAlpha]);

  const calibrateNeutral = useCallback(() => {
    return fusionEngineRef.current.calibrateCurrentAsNeutral();
  }, []);

  return {
    tilt,
    rawAccel,
    rawGyro,
    isSensorAvailable,
    useVirtual,
    setUseVirtual: setUseVirtualAndRef,
    setVirtualTilt,
    calibrateNeutral,
  };
}

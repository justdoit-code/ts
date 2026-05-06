import React, { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
import { Target, Base, Conflict, REGIONS } from '../types';

// Cesium base URL is defined in vite.config.ts
// window.CESIUM_BASE_URL = '/cesium';

interface GlobeProps {
  targets: Target[];
  bases: Base[];
  conflicts: Conflict[];
  viewMode: '3D' | '2D';
  selectedRegion?: string;
  onTargetClick: (target: Target) => void;
  onBaseClick: (base: Base) => void;
  onConflictClick: (conflict: Conflict) => void;
  layers: {
    air: boolean;
    sea: boolean;
    bases: boolean;
    conflicts: boolean;
  };
  activeTrack?: { lat: number, lon: number, altitude?: number }[];
  playbackIndex?: number;
  hotspots?: import('../types').Hotspot[];
}

const Globe: React.FC<GlobeProps> = ({ 
  targets, 
  bases, 
  conflicts,
  viewMode, 
  selectedRegion, 
  onTargetClick, 
  onBaseClick,
  onConflictClick,
  layers,
  activeTrack,
  playbackIndex,
  hotspots
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);

  // @ts-ignore
  window.CESIUM_BASE_URL = '/cesium/';

  useEffect(() => {
    if (!containerRef.current) return;

    let isMounted = true;
    let _viewer: Cesium.Viewer;

    const initCesium = async () => {
      _viewer = new Cesium.Viewer(containerRef.current as HTMLDivElement, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        scene3DOnly: false,
        requestRenderMode: true,
      });

      // Better imagery for higher resolution
      try {
        const imagery = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
          'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
        );
        _viewer.imageryLayers.remove(_viewer.imageryLayers.get(0));
        _viewer.imageryLayers.addImageryProvider(imagery);
      } catch (e) {
        console.warn('Failed to load ArcGIS imagery', e);
      }

      if (isMounted) {
        setViewer(_viewer);
      }
    };

    initCesium();
    
    return () => {
      isMounted = false;
      if (_viewer) {
        _viewer.destroy();
      }
    };
  }, []);

  // Handle 3D/2D switch
  useEffect(() => {
    if (!viewer) return;
    if (viewMode === '3D') {
      viewer.scene.morphTo3D(0.5);
    } else {
      viewer.scene.morphTo2D(0.5);
    }
  }, [viewer, viewMode]);

  // Handle regionFlyTo
  useEffect(() => {
    if (!viewer || !selectedRegion) return;
    
    const region = REGIONS.find(r => r.name === selectedRegion);
    if (region) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(region.center.lon, region.center.lat, region.height),
        duration: 2
      });
    }
  }, [viewer, selectedRegion]);

  // Update entities
  useEffect(() => {
    if (!viewer) return;

    viewer.entities.suspendEvents();

    // 1. Update Bases
    bases.forEach(base => {
      const entityId = `base-${base.id}`;
      let entity = viewer.entities.getById(entityId);
      
      if (!layers.bases) {
        if (entity) entity.show = false;
        return;
      }

      const position = Cesium.Cartesian3.fromDegrees(base.lon, base.lat);

      if (!entity) {
        entity = viewer.entities.add({
          id: entityId,
          position: position,
          point: {
            pixelSize: base.level === 1 ? 12 : 8,
            color: Cesium.Color.YELLOW,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
          },
          label: {
            text: base.name,
            font: '14px sans-serif',
            showBackground: true,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            pixelOffset: new Cesium.Cartesian2(15, 0),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          properties: base
        });
      } else {
        entity.show = true;
        entity.position = position as any;
      }
    });

    // 2. Update Targets
    targets.forEach(target => {
      const entityId = `target-${target.id}`;
      const isVisible = (target.type === 'air' && layers.air) || (target.type === 'sea' && layers.sea);
      let entity = viewer.entities.getById(entityId);

      if (!isVisible) {
        if (entity) entity.show = false;
        return;
      }

      const position = Cesium.Cartesian3.fromDegrees(target.lon, target.lat, target.altitude || 0);

      if (!entity) {
        entity = viewer.entities.add({
          id: entityId,
          position: position,
          point: {
            pixelSize: 10,
            color: target.type === 'air' ? Cesium.Color.RED : Cesium.Color.BLUE,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
          },
          label: {
            text: target.name,
            font: '12px sans-serif',
            pixelOffset: new Cesium.Cartesian2(0, -20),
            showBackground: true,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          properties: target
        });
      } else {
        entity.show = true;
        if (!Cesium.Cartesian3.equals(entity.position?.getValue(Cesium.JulianDate.now()), position)) {
          entity.position = position as any;
        }
        entity.properties = target as any;
      }
    });

    // 2.5 Update Conflicts
    conflicts.forEach(conflict => {
      const entityId = `conflict-${conflict.id}`;
      let entity = viewer.entities.getById(entityId);

      if (!layers.conflicts) {
        if (entity) entity.show = false;
        return;
      }

      const position = Cesium.Cartesian3.fromDegrees(conflict.lon, conflict.lat);

      if (!entity) {
        entity = viewer.entities.add({
          id: entityId,
          position: position,
          point: {
            pixelSize: 15,
            color: Cesium.Color.fromCssColorString('#FF4500'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
          },
          label: {
            text: `⚠️ ${conflict.name}`,
            font: 'bold 14px sans-serif',
            pixelOffset: new Cesium.Cartesian2(0, -25),
            showBackground: true,
            backgroundColor: Cesium.Color.fromCssColorString('rgba(15, 23, 42, 0.8)'),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          properties: conflict
        });
        
        // Add a pulsing halo effect for conflicts if possible, or just a simple pulse label
      } else {
        entity.show = true;
        entity.position = position as any;
        entity.properties = conflict as any;
      }
    });

    // Cleanup
    const targetIds = new Set(targets.map(t => `target-${t.id}`));
    const baseIds = new Set(bases.map(b => `base-${b.id}`));
    const conflictIds = new Set(conflicts.map(c => `conflict-${c.id}`));
    
    const entitiesToRemove = [];
    for (let i = 0; i < viewer.entities.values.length; i++) {
      const e = viewer.entities.values[i];
      const idStr = e.id.toString();
      if (idStr.startsWith('target-') && !targetIds.has(idStr)) {
        entitiesToRemove.push(e);
      } else if (idStr.startsWith('base-') && !baseIds.has(idStr)) {
        entitiesToRemove.push(e);
      } else if (idStr.startsWith('conflict-') && !conflictIds.has(idStr)) {
        entitiesToRemove.push(e);
      }
    }
    entitiesToRemove.forEach(e => viewer.entities.remove(e));
    
    // 3. Update active track (Trail and History)
    const historyLineId = 'history-track-line';
    const playedLineId = 'played-track-line';
    
    let historyEntity = viewer.entities.getById(historyLineId);
    let playedEntity = viewer.entities.getById(playedLineId);
    
    if (activeTrack && activeTrack.length >= 2) {
      const fullPositions = activeTrack.map(p => Cesium.Cartesian3.fromDegrees(p.lon, p.lat, p.altitude || 0));
      
      // History Ghost Line
      if (!historyEntity) {
        historyEntity = viewer.entities.add({
          id: historyLineId,
          polyline: {
            positions: fullPositions,
            width: 2,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.WHITE.withAlpha(0.2),
              dashLength: 16
            })
          }
        });
      } else {
        (historyEntity.polyline as any).positions = new Cesium.ConstantProperty(fullPositions);
        historyEntity.show = true;
      }

      // Played Trail Line
      if (playbackIndex !== undefined) {
        const playedCount = Math.floor(playbackIndex) + 1;
        const playedPositions = fullPositions.slice(0, playedCount);
        
        // Add the interpolated current point to make it perfectly smooth
        if (playbackIndex % 1 !== 0 && playedCount < fullPositions.length) {
          const t = playbackIndex % 1;
          const p1 = fullPositions[playedCount - 1];
          const p2 = fullPositions[playedCount];
          const currentPos = Cesium.Cartesian3.lerp(p1, p2, t, new Cesium.Cartesian3());
          playedPositions.push(currentPos);
        }

        if (playedPositions.length >= 2) {
          if (!playedEntity) {
            playedEntity = viewer.entities.add({
              id: playedLineId,
              polyline: {
                positions: playedPositions,
                width: 5,
                material: new Cesium.PolylineGlowMaterialProperty({
                  glowPower: 0.2,
                  color: Cesium.Color.CYAN
                })
              }
            });
          } else {
            (playedEntity.polyline as any).positions = new Cesium.ConstantProperty(playedPositions);
            playedEntity.show = true;
          }
        } else if (playedEntity) {
          playedEntity.show = false;
        }
      } else {
        if (playedEntity) playedEntity.show = false;
      }
    } else {
      if (historyEntity) historyEntity.show = false;
      if (playedEntity) playedEntity.show = false;
    }

    // 4. Update Hotspots
    const currentHotspots = (layers as any).hotspots ? (hotspots || []) : [];
    const hotspotIds = new Set(currentHotspots.map(h => `hotspot-${h.id}`));

    // Remove old hotspots
    viewer.entities.values.forEach(e => {
      const idStr = e.id.toString();
      if (idStr.startsWith('hotspot-') && !hotspotIds.has(idStr)) {
        viewer.entities.remove(e);
      }
    });

    // Add/Update hotspots
    currentHotspots.forEach(h => {
      const entityId = `hotspot-${h.id}`;
      let entity = viewer.entities.getById(entityId);
      
      const position = Cesium.Cartesian3.fromDegrees(h.lon, h.lat, 500);

      if (!entity) {
        entity = viewer.entities.add({
          id: entityId,
          position: position,
          point: {
            pixelSize: 8,
            color: h.sentiment === 'positive' ? Cesium.Color.SPRINGGREEN : h.sentiment === 'negative' ? Cesium.Color.ORANGERED : Cesium.Color.GOLD,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          },
          label: {
            text: h.title,
            font: 'bold 12px "Microsoft YaHei", sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -15),
            backgroundColor: new Cesium.Color(0.1, 0.1, 0.1, 0.8),
            showBackground: true,
            backgroundPadding: new Cesium.Cartesian2(8, 4),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        });
      } else {
        entity.show = true;
        entity.position = position as any;
      }
    });

    viewer.entities.resumeEvents();
    viewer.scene.requestRender();
    
  }, [viewer, targets, bases, layers, activeTrack, playbackIndex, hotspots]);

  // Click Handler
  useEffect(() => {
    if (!viewer) return;

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click: any) => {
      const pickedObject = viewer.scene.pick(click.position);
      if (Cesium.defined(pickedObject) && pickedObject.id) {
        const entity = pickedObject.id;
        const idStr = entity.id?.toString();
        if (!idStr) return;
        
        if (idStr.startsWith('target-')) {
          onTargetClick(entity.properties.getValue(Cesium.JulianDate.now()));
        } else if (idStr.startsWith('base-')) {
          onBaseClick(entity.properties.getValue(Cesium.JulianDate.now()));
        } else if (idStr.startsWith('conflict-')) {
          onConflictClick(entity.properties.getValue(Cesium.JulianDate.now()));
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => handler.destroy();
  }, [viewer, onTargetClick, onBaseClick, onConflictClick]);

  return <div ref={containerRef} className="w-full h-full" id="cesium-container" />;
};

export default Globe;

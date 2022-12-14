import { Button, Grid, MenuItem, Select } from "@mui/material";
import { Loader } from "google-maps";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { getCurrentPosition } from "../util/geolocation";
import { makeCarIcon, makeMarkerIcon, Map } from "../util/map";
import { Route } from "../util/models";
import { sample, shuffle } from "lodash";
import { randomColor } from "../util/randomColor";
import { RouteExistsError } from "../errors/route-exists.error";
import { useSnackbar } from "notistack";
import { makeStyles } from "tss-react/mui"; // "tss-react/mui-compat" 
import { Navbar } from "./Navbar";
import { connect, Socket } from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL as string;

const googleMapsLoader = new Loader(process.env.REACT_GOOGLE_API_KEY);
const COLORS: string[] = [];

const useStyles = makeStyles()({
  root: {
    width: '100%',
    height: '100%',
  },
  form: {
    margin: '16px',
  },
  btnSubmitWrapper: {
    textAlign: 'center',
    marginTop: '8px',
    width: "100%"
  },
  map: {
    width: '100%',
    height: '100%',
  },
});


type Props = {};

export const Mapping = (props: Props) => {
  const { classes } = useStyles();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeIdSelected, setRouteIdSelected] = useState<string>('');
  const mapRef = useRef<Map>();
  const socketIORef = useRef<Socket>();
  const { enqueueSnackbar } = useSnackbar();

  const finishRoute = useCallback((route: Route) => {
    enqueueSnackbar(`${route.title} finalizou!`, {
      variant: 'success'
    });
    mapRef.current?.removeRoute(route.id);
  }, [enqueueSnackbar])

  useEffect(() => {
    if (!socketIORef.current?.connected) {
      socketIORef.current = connect(API_URL);
      socketIORef.current.on('connect', () => console.log('conectou'));
    }
    const handler = (data: {
      routeId: string;
      position: [number, number];
      finished: boolean;
    }) => {
      mapRef.current?.moveCurrentMarket(data.routeId, {
        lat: data.position[0],
        lng: data.position[1],
      });
      const route = routes.find((route) => route.id === data.routeId) as Route;
      if (data.finished) {
        finishRoute(route);
      }
    };
    socketIORef.current?.on('new-position', handler);
    return () => {
      socketIORef.current?.off("new-position", handler);
    }
  }, [finishRoute, routes, routeIdSelected]);

  useEffect(() => {
    fetch(`${API_URL}/routes`)
      .then(data => data.json())
      .then(data => setRoutes(data));
  }, []);

  useEffect(() => {
    (async () => {
      const [, position] = await Promise.all([
        googleMapsLoader.load(),
        getCurrentPosition({ enableHighAccuracy: true })
      ]);
      const divMap = document.getElementById('map') as HTMLElement;
      mapRef.current = new Map(divMap, {
        zoom: 15,
        center: position,
      });
    })();
  }, [])

  const startRoute = useCallback((event: FormEvent) => {
    event.preventDefault();
    const route = routes.find((route) => route.id === routeIdSelected);
    const color = randomColor();
    try {
      mapRef.current?.addRoute(routeIdSelected, {
        currentMarkerOptions: {
          position: route?.startPosition,
          icon: makeCarIcon(color),
        },
        endMarkerOptions: {
          position: route?.endPosition,
          icon: makeMarkerIcon(color),
        },
      });
      socketIORef.current?.emit('new-direction', {
        routeId: routeIdSelected
      });
    } catch (error) {
      if (error instanceof RouteExistsError) {
        enqueueSnackbar(`${route?.title} j?? adicionado. Espere finalizar.`, {
          variant: "error",
        });
        return;
      }

      throw error;
    }
  }, [routeIdSelected, routes, enqueueSnackbar]);

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} sm={3}>
        <Navbar />
        <form onSubmit={startRoute} className={classes.form}>
          <Select
            fullWidth
            displayEmpty
            value={routeIdSelected}
            onChange={(event) => setRouteIdSelected(event.target.value)}
          >
            <MenuItem value="">
              <em>Selecione uma corrida</em>
            </MenuItem>
            {routes.map((route, key) => (
              <MenuItem key={key} value={route.id}>
                {route.title}
              </MenuItem>
            ))}
          </Select>
          <div className={classes.btnSubmitWrapper}>
            <Button fullWidth type="submit" variant="contained">
              Iniciar uma corrida
            </Button>
          </div>
        </form>
      </Grid>
      <Grid item xs={12} sm={9}>
        <div id="map" className={classes.map}></div>
      </Grid>
    </Grid>
  );
};
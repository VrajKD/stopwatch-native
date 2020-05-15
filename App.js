import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import moment from 'moment';

function Timer({ interval, style }) {

  const pad = n => (n < 10 ? '0' + n : n)
  const duration = moment.duration(interval);
  const centisec = Math.floor(duration.milliseconds() / 10)
  return (
    <View style={{ flexDirection: "row" }}>
      <Text style={style}>
        {pad(duration.minutes())}:</Text>
      <Text style={style}>
        {pad(duration.seconds())}:
      </Text>
      <Text style={style}>
        {pad(centisec)}
      </Text >
    </View>
  )
}

function RoundButton({ title, color, bg, onPress, disabled }) {
  return (
    <TouchableOpacity onPress={() => !disabled && onPress()}
      activeOpacity={disabled ? 0.5 : 0.6}
      style={[styles.button, { backgroundColor: bg }, disabled && { opacity: 0.5 }]}>
      <View style={styles.buttonBorder}>
        <Text style={{ color, fontSize: 18 }}>{title}</Text>
      </View>
    </TouchableOpacity>
  )
}

function ButtonRow({ children }) {
  return (
    <View style={styles.buttonRow}>
      {children}
    </View>
  )
}


function Lap({ number, interval, fastest, slowest }) {

  const lapTextStyle = [
    styles.lapText,
    fastest && styles.fastest,
    slowest && styles.slowest
  ]

  return (
    <View style={styles.lap}>
      <Text style={lapTextStyle}>Lap {number}</Text>
      <Timer style={[lapTextStyle, styles.lapTimer]} interval={interval} />
    </View>
  )
}

function LapTable({ laps, timer }) {
  const finLaps = laps.slice(1);
  let max = -1;
  let min = Number.MAX_SAFE_INTEGER;
  if (finLaps.length >= 2) {
    finLaps.forEach(lap => {
      if (min > lap) min = lap
      if (max < lap) max = lap
    })
  }
  return (
    <ScrollView style={styles.lapScroll}>
      {
        laps.map((lap, index) => (
          <Lap interval={index === 0 ? timer + lap : lap} key={laps.length - index} number={laps.length - index} fastest={lap === min} slowest={lap === max} />
        ))
      }
    </ScrollView>
  )
}


export default class App extends React.Component {

  state = {
    start: 0,
    now: 0,
    laps: [],
    running: false
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  start = () => {
    const now = new Date().getTime();
    this.setState({
      start: now,
      now,
      running: true,
      laps: [0]
    })

    this.timer = setInterval(() => {
      this.setState({ now: new Date().getTime() })
    }, 100)
  }

  lap = () => {
    const timestamp = new Date().getTime();
    const { laps, now, start } = this.state;
    const [firstLap, ...other] = laps;
    this.setState({
      start: timestamp,
      now: timestamp,
      laps: [0, firstLap + now - start, ...other]
    })
  }

  stop = () => {
    clearInterval(this.timer)
    const { laps, start, now } = this.state;
    const [firstLap, ...other] = laps;
    this.setState({
      start: 0,
      now: 0,
      laps: [firstLap + now - start, ...other],
      running: false
    })
  }

  reset = () => {
    this.setState({
      laps: [],
      start: 0,
      now: 0,
    })
  }

  resume = () => {
    const now = new Date().getTime();
    this.setState({
      start: now,
      now,
      running: true
    })
    this.timer = setInterval(() => {
      this.setState({ now: new Date().getTime() })
    }, 100)
  }

  render() {
    const { now, start, laps, running } = this.state;
    return (
      <View style={styles.container} >
        <Timer interval={laps.reduce((total, curr) => total + curr, 0) + now - start} style={styles.timer} />
        {laps.length === 0 && (
          <ButtonRow>
            <RoundButton title="Reset" color="#FFF" bg="#3D3D3D" disabled onPress={this.reset} />
            <RoundButton title="Start" color="#50D167" bg="#1B361F" onPress={this.start} />
          </ButtonRow>
        )}

        {running && (

          <ButtonRow>
            <RoundButton title="Lap" color="#FFF" bg="#3D3D3D" onPress={this.lap} />
            <RoundButton title="Stop" color="#E33935" bg="#3C1715" onPress={this.stop} />
          </ButtonRow>

        )}

        {laps.length > 0 && !running && (

          <ButtonRow>
            <RoundButton title="Reset" color="#FFF" bg="#3D3D3D" onPress={this.reset} />
            <RoundButton title="Resume" color="#50D167" bg="#1B361F" onPress={this.resume} />
          </ButtonRow>

        )}

        <LapTable laps={laps} timer={now - start} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: "center",
    paddingTop: 150,
    paddingHorizontal: 50
  },
  timer: {
    fontSize: 65,
    color: "white",
    fontWeight: "100",
    width: 100
  },
  button: {
    height: 90,
    width: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center"
  },
  buttonBorder: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonRow: {
    flexDirection: "row",
    alignSelf: "stretch",
    justifyContent: "space-between",
    marginTop: 50,
    marginBottom: 30
  },
  lap: {
    flexDirection: "row",
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderColor: "#BBB",
    borderBottomWidth: 0.3
  },
  lapText: {
    color: "#FFF",
    fontSize: 18,
  },
  lapTimer: {
    width: 30
  },
  lapScroll: {
    alignSelf: 'stretch'
  },
  fastest: {
    color: "#4BC05F"
  },
  slowest: {
    color: "#CC3531"
  }
});

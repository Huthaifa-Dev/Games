import {
    DAY_LENGTH,
    NIGHT_LENGTH,
    RAIN_CHANCE,
    SCENES,
    getNextHungerTime,
    getNextDieTime,
    getNextPoopTime,
} from "./constants";
import { modFox, modScene, togglePoopBag, writeModal } from "./ui";

const gameState = {
    current: "INIT",
    clock: 1,
    wakeTime: -1,
    sleepTime: -1,
    hungryTime: -1,
    dieTime: -1,
    timeToStartCelebrating: -1,
    timeToEndCelebrating: -1,
    tick() {
        this.clock++;
        console.log("clock", this.clock);

        if (this.clock === this.wakeTime) {
            this.wake();
        } else if (this.clock === this.sleepTime) {
            this.sleep();
        } else if (this.clock === this.hungryTime) {
            this.getHungry();
        } else if (this.clock === this.dieTime) {
            this.die();
        } else if (this.clock === this.timeToStartCelebrating) {
            this.startCelebrating();
        } else if (this.clock === this.timeToEndCelebrating) {
            this.endCelebrating();
        } else if (this.clock === this.poopTime) {
            this.poop();
        }
        return this.clock;
    },

    startGame() {
        this.current = "HATCHING";
        this.wakeTime = this.clock + 3;
        modFox("egg");
        modScene("day");
        writeModal();
    },
    wake() {
        this.current = "IDLING";
        this.wakeTime = -1;
        this.scene = Math.random() > RAIN_CHANCE ? 0 : 1;
        modScene(SCENES[this.scene]);
        this.sleepTime = this.clock + DAY_LENGTH;
        this.hungryTime = getNextHungerTime(this.clock);
        this.determineFoxState();
    },
    sleep() {
        this.current = "SLEEP";
        modFox("sleep");
        modScene("night");
        this.clearTimes();
        this.wakeTime = this.clock + NIGHT_LENGTH;
    },
    clearTimes() {
        this.wakeTime = -1;
        this.sleepTime = -1;
        this.hungryTime = -1;
        this.dieTime = -1;
        this.poopTime = -1;
        this.timeToStartCelebrating = -1;
        this.timeToEndCelebrating = -1;
    },
    getHungry() {
        this.current = "HUNGRY";
        this.dieTime = getNextDieTime(this.clock);
        this.hungryTime = -1;
        modFox("hungry");
    },
    die() {
        this.current = "DEAD";
        modFox("dead");
        modScene("dead");
        this.clearTimes();
        writeModal(
            "The fox died :( <br/> press the middle button to start over!"
        );
    },
    startCelebrating() {
        this.current = "CELEBRATING";
        this.timeToStartCelebrating = -1;
        this.timeToEndCelebrating = this.clock + 2;
        modFox("celebrate");
    },
    endCelebrating() {
        this.timeToEndCelebrating = -1;
        this.current = "IDLING";
        this.determineFoxState();
        togglePoopBag(false);
    },
    determineFoxState() {
        if (this.current === "IDLING") {
            if (SCENES[this.scene] === "rain") {
                modFox("rain");
            } else {
                modFox("idling");
            }
        }
    },
    changeWeather() {
        this.scene = (this.scene + 1) % SCENES.length;
        modScene(SCENES[this.scene]);
        this.determineFoxState();
    },

    feed() {
        if (this.current !== "HUNGRY") {
            return;
        } else {
            this.current = "FEEDING";
            this.dieTime = -1;
            this.poopTime = getNextPoopTime(this.clock);
            modFox("eating");
            this.timeToStartCelebrating = this.clock + 2;
        }
    },
    poop() {
        this.current = "POOPING";
        this.poopTime = -1;
        this.dieTime = getNextDieTime(this.clock);
        modFox("pooping");
    },
    cleanUpPoop() {
        if (!this.current === "POOPING") {
            return;
        }
        this.dieTime = -1;
        togglePoopBag(true);
        this.startCelebrating();
        this.hungryTime = getNextHungerTime(this.clock);
    },
    handleUserAction(icon) {
        if (
            ["SLEEP", "FEEDING", "CELEBRATING", "HATCHING"].includes(
                this.current
            )
        ) {
            // do nothing
            return;
        }

        if (this.current === "INIT" || this.current === "DEAD") {
            this.startGame();
            return;
        } else if (this.clock === this.sleepTime) {
            this.sleep();
        }

        switch (icon) {
            case "weather":
                this.changeWeather();
                break;
            case "poop":
                this.cleanUpPoop();
                break;
            case "fish":
                this.feed();
                break;
        }
    },
};

export const handleUserAction = gameState.handleUserAction.bind(gameState);
export default gameState;

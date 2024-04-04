import type { Socket } from "socket.io-client";

export default class LobbyPage {
    public static readonly hostButton = document.querySelector("#host-game-button") as HTMLButtonElement;
    public static readonly lobbiesTable = document.querySelector("#lobby-page table tbody") as HTMLTableSectionElement;

    private static init = false;
    private static socket: Socket | undefined = undefined;

    public static bindEvents(socket: Socket) {
        if (!this.init) {
            this.socket = socket;

            this.hostButton.addEventListener("click", () => {
                socket.emit("host", (room_id: string) => {
                    console.log("room was created: ", room_id);
                });
            });

            socket.on("update_lobby", (rooms: Room[]) => {
                this.updateRooms(rooms);
            });

            this.init = true;
        }
    }

    /**
     * A player is trying to join a room.
     */
    private static onPlayerAskingToJoin(room_id: string): void {
        if (this.socket) {
            this.socket.emit("join_room", room_id, (success: boolean) => {
                if (success) {
                    console.log("joined room successfully");
                } else {
                    console.log("failed to join room", room_id);
                }
            });
        }
    }

    /**
     * Creates a row to be displayed in {@link lobbiesTable}.
     */
    private static createRoomElement(room: Room): HTMLTableRowElement {
        const tr = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdBtn = document.createElement("td");
        const btn = document.createElement("button");
        const icon = document.createElement("i");
        icon.className = "fa-solid fa-play";
        btn.appendChild(icon);
        btn.append("Rejoindre");
        btn.addEventListener("click", () => {
            this.onPlayerAskingToJoin(room.id);
        });
        tdBtn.appendChild(btn);
        tdName.append(`${room.id} : ${room.players.length} joueur${room.players.length > 1 ? 's' : ''}`);
        tr.appendChild(tdName);
        tr.appendChild(tdBtn);
        return tr;
    }

    /**
     * Clears the rooms that are currently being displayed in {@link lobbiesTable}.
     */
    private static clearRooms(): void {
        while (this.lobbiesTable.firstChild) {
            this.lobbiesTable.removeChild(this.lobbiesTable.firstChild);
        }
    }

    /**
     * Creates the rows of {@link lobbiesTable} so that the player can join them.
     */
    public static updateRooms(rooms: Room[]): void {
        this.clearRooms();
        for (const room of rooms) {
            this.lobbiesTable.appendChild(this.createRoomElement(room));
        }
    }

    public static requestRooms() {
        if (this.socket) {
            this.socket.emit("request_lobby", (rooms: Room[]) => {
                this.updateRooms(rooms);
            });
        }
    }
}

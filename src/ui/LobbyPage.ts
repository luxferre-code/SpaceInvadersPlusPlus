import type { Socket } from "socket.io-client";

export default class LobbyPage {
    public static readonly lobbyPage = document.querySelector("#lobby-page") as HTMLElement;
    public static readonly containerPlayers = this.lobbyPage.querySelector(".container-players-in-lobby") as HTMLElement;
    public static readonly containerPlayersList = this.containerPlayers.querySelector("ul") as HTMLUListElement;
    public static readonly noteAwaitingForManager = this.containerPlayers.querySelector("p:first-of-type") as HTMLParagraphElement;
    public static readonly noteForAwaitingPlayers = this.containerPlayers.querySelector("p:last-of-type") as HTMLParagraphElement;
    public static readonly hostUsername = this.noteAwaitingForManager.querySelector("span") as HTMLSpanElement;
    public static readonly hostButton = this.lobbyPage.querySelector("#host-game-button") as HTMLButtonElement;
    public static readonly lobbiesTable = this.lobbyPage.querySelector("table tbody") as HTMLTableSectionElement;

    private static init = false;
    private static socket: Socket | undefined = undefined;
    private static hosted_room_id: string | undefined = undefined;
    private static joined_room_id: string | undefined = undefined;

    private static isHostingGame(): boolean {
        return this.hosted_room_id != undefined;
    }

    private static isClient(): boolean {
        return this.joined_room_id != undefined;
    }

    public static bindEvents(socket: Socket) {
        if (!this.init) {
            this.socket = socket;

            this.hostButton.addEventListener("click", () => {
                socket.emit("host", (room_id: string) => {
                    if (!this.isHostingGame()) {
                        this.hostButton.textContent = "Lancer la partie";
                        this.hostUsername.textContent = socket.id!;
                        this.hosted_room_id = room_id;
                        this.containerPlayers.setAttribute("aria-hidden", "false");
                        this.lobbiesTable.setAttribute("aria-hidden", "true");
                        this.noteForAwaitingPlayers.setAttribute("aria-hidden", "false");
                    } else {
                        // Start the game
                    }
                });
            });

            socket.on("update_lobby", (rooms: Room[]) => {
                if (this.isClient() || this.isHostingGame()) {
                    const room_id = this.isClient() ? this.joined_room_id : this.hosted_room_id;
                    const players = rooms.find(r => r.id === room_id)!.players.filter(p => p !== socket.id);
                    console.log("players in the room", room_id, players);
                    if (players.length > 0) {
                        this.updateAwaitingPlayers(players);
                    }
                } else {
                    this.updateRooms(rooms);
                }
            });

            this.init = true;
        }
    }

    /**
     * A player is trying to join a room.
     */
    private static onPlayerAskingToJoin(room_id: string): void {
        if (this.socket) {
            this.socket.emit("join_room", room_id, ({ success, manager_username }: { success: boolean, manager_username?: string }) => {
                if (success) {
                    this.joined_room_id = room_id;
                    this.hostButton.setAttribute("aria-hidden", "true");
                    this.hostUsername.textContent = manager_username!;
                    this.containerPlayers.setAttribute("aria-hidden", "false");
                    this.lobbiesTable.setAttribute("aria-hidden", "true");
                    this.noteForAwaitingPlayers.setAttribute("aria-hidden", "false");
                    this.noteAwaitingForManager.setAttribute("aria-hidden", "false");
                } else {
                    alert("Action impossible.");
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

    private static createAwaitingPlayerElement(player: string): HTMLElement {
        const li = document.createElement("li");
        li.append(player);
        return li;
    }

    /**
     * Clears the rooms that are currently being displayed in {@link lobbiesTable}.
     */
    private static clear(element: HTMLElement): void {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    /**
     * Creates the rows of {@link lobbiesTable} so that the player can join them.
     */
    public static updateRooms(rooms: Room[]): void {
        this.clear(this.lobbiesTable);
        for (const room of rooms) {
            this.lobbiesTable.appendChild(this.createRoomElement(room));
        }
    }

    public static updateAwaitingPlayers(players: string[]): void {
        this.clear(this.containerPlayersList);
        for (const player of players) {
            this.containerPlayersList.appendChild(this.createAwaitingPlayerElement(player));
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

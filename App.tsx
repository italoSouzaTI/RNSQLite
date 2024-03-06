import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TextInput, Pressable, Alert } from "react-native";

import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { Asset } from "expo-asset";

const DBNAME = "lista.db";
export default function App() {
    const [valueChange, setValueChange] = useState("");
    const [value, setValue] = useState([]);
    const db = SQLite.openDatabase(DBNAME);

    async function openDatabase() {
        try {
            db.transaction((tx) => {
                tx.executeSql("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)");
            });
            console.log("sucess");
        } catch (error) {
            console.log(error);
        }
    }

    async function createItem(item: string) {
        try {
            db.transaction((tx) => {
                tx.executeSql(
                    "INSERT INTO tasks (name) VALUES (?)",
                    [item],
                    async (_, result) => {
                        console.log("Inserido com sucesso! ID da nova tarefa:", result.insertId);
                        setValueChange("");
                        await selectAll();
                    },
                    (_, error) => {
                        console.log("Erro ao inserir tarefa:", error);
                    }
                );
            });
        } catch (error) {}
    }
    async function selectAll() {
        try {
            await db.transactionAsync(async (response) => {
                const result = await response.executeSqlAsync("SELECT * FROM tasks");
                let aux = [];
                if (result.rows.length > 0) {
                    result.rows.map((item) => {
                        aux.push(item.name);
                    });
                    setValue(aux);
                }
            });
        } catch (error) {}
    }

    async function handleSave() {
        try {
            if (valueChange.trim().length <= 0) {
                Alert.alert("Preencha o campo");
                return;
            }
            await createItem(valueChange);
        } catch (error) {}
    }
    async function handleShared() {
        try {
            // const response = await Sharing.isAvailableAsync();
            // console.log("handleShared", response);
            await Sharing.shareAsync(FileSystem.documentDirectory + "SQLite/lista.db", {
                dialogTitle: "share or copy your DB via",
            }).catch((error) => {
                console.log(error);
            });
        } catch (error) {}
    }
    useEffect(() => {
        openDatabase();
        selectAll();
        const fileSystemPath = async () => {
            console.log(FileSystem.documentDirectory);
        };
        fileSystemPath();
    }, []);
    return (
        <View style={styles.container}>
            <Text>Teste DB</Text>
            <TextInput
                style={styles.input}
                value={valueChange}
                onChangeText={setValueChange}
                placeholder="Qualquer coisa"
            />
            <Pressable onPress={handleSave} style={styles.buttonPress}>
                <Text style={styles.labelBtn}>Salvar</Text>
            </Pressable>
            <Pressable onPress={handleShared} style={styles.buttonSharedPress}>
                <Text style={styles.labelBtn}>Compartilhar</Text>
            </Pressable>
            <StatusBar style="auto" />
            <Text>{value.map((item) => item + "\n")}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        gap: 16,
    },
    input: {
        width: "100%",
        height: 50,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#cecece",
        paddingHorizontal: 16,
    },
    buttonPress: {
        width: "100%",
        height: 50,
        borderRadius: 20,
        backgroundColor: "green",
        justifyContent: "center",
        alignItems: "center",
    },
    buttonSharedPress: {
        width: "100%",
        height: 50,
        borderRadius: 20,
        backgroundColor: "orange",
        justifyContent: "center",
        alignItems: "center",
    },
    labelBtn: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
    },
});

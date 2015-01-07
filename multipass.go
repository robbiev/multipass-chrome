package main

import (
	"encoding/binary"
	"encoding/json"
	"log"
	"os"
	"os/user"
	"runtime/debug"

	"github.com/robbiev/multipass"
)

type KeychainResponse struct {
	Success bool
	Items   []multipass.Item
}

type HomeResponse struct {
	Success bool
	Home    string
}

func getHome() (string, error) {
	usr, err := user.Current()
	if err != nil {
		return "", err
	}
	return usr.HomeDir, nil
}

func getHomeResponse() HomeResponse {
	home, err := getHome()
	if err != nil {
		log.Println(err)
		return HomeResponse{Success: false}
	}
	return HomeResponse{Success: true, Home: home}
}

func getKeychain(onePasswordDir string, password []byte) KeychainResponse {
	keyChain := multipass.NewAgileKeyChain(onePasswordDir)
	defer keyChain.Close()
	err := keyChain.Open(password)
	response := KeychainResponse{Success: err == nil}
	if err == nil {
		var items []multipass.Item
		keyChain.ForEachItem(func(p string, f []byte) error {
			item, err := multipass.DecryptFile(f, keyChain.Keys())
			if err == nil {
				items = append(items, item)
			}
			return nil
		})
		response.Items = items
	}
	return response
}

func main() {
	defer func() {
		if r := recover(); r != nil {
			log.Println("Recovered in main", r)
			log.Printf("%s\n", debug.Stack())
		}
	}()

	for {
		// get message length, 4 bytes
		var length uint32
		err := binary.Read(os.Stdin, binary.LittleEndian, &length)
		if err != nil {
			break
		}

		// read message
		message := make([]byte, length)
		_, err = os.Stdin.Read(message)
		if err != nil {
			break
		}

		log.Println("read message")

		type Command struct {
			Action  string
			Payload interface{}
		}

		var command Command
		json.Unmarshal(message, &command)

		var respMessage interface{}
		if command.Action == "keychain" {
			payload := command.Payload.(map[string]interface{})
			password := []byte(payload["Password"].(string))
			location := payload["Location"].(string)
			respMessage = getKeychain(location, password)
		} else if command.Action == "home" {
			respMessage = getHomeResponse()
		} else {
			panic("unknown action")
		}

		encoded, _ := json.Marshal(respMessage)
		binary.Write(os.Stdout, binary.LittleEndian, uint32(len(encoded)))
		_, err = os.Stdout.Write(encoded)
		if err != nil {
			log.Println(err)
			break
		}
	}
}

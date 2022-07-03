# Groupomania Backend

<img src="https://i.imgur.com/M4FoPs7.png" />

## Installer le serveur

Cloner le projet, puis exécuter `npm i` depuis la racine du projet pour installer toutes les dépendances requises

## Utiliser le serveur

Si Nodemon est installé, exécuter la commande `npm start` depuis la racine du projet, sinon exécuter `node server`.  
Toutes les requètes seront envoyées à `http://localhost:3000`  

# Installation de la bdd

## Si un fichier .sql a été fourni

il est possible de ne créer qu'une base de donnée:
 - database_development_groupomania

Ensuite depuis le dossier ou se trouve le fichier .sql exécuter `mysql -u root -p database_development_groupomania < nom_du_fichier.sql`
 
## Si aucun fichier .sql n'a été fourni 
 
 il faudra créer 3 bases de données:
 - database_development_groupomania
 - database_test_groupomania
 - database_production_groupomania  
 
 Une fois cette étape complétée, exécuter `npx sequelize db:migrate`depuis la racine du projet  



# Remplacer les mots de passe du fichier config.json

Il est nécessaire de remplacer les mots de passe du fichier `config/config.json` par celui de votre utilisateur 'root' mysql

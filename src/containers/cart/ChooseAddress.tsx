import {DataStore} from 'aws-amplify';
import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {
  CustomButton,
  CustomHeader,
  CustomStatusBar,
  FullScreenLoader,
} from '../../components';
import AddressItem from '../../components/AddressItem';
import {Address} from '../../models';
import {createOrderManager} from '../../redux/cart';
import {navigate} from '../../services/Routerservices';
import {getScreenHeight, showToast} from '../../utils/domUtils';

const ChooseAddress = () => {
  const theme = useSelector((state: any) => state.theme.theme);
  const userData = useSelector((state: any) => state.auth.userData);
  const orderLoading = useSelector((state: any) => state.common.loading);
  const cartProducts = useSelector((state: any) => state.cart.cartProducts);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const sub = DataStore.observeQuery(Address, address =>
      address.userID.eq(userData.id),
    ).subscribe(({items}: any) => {
      setLoading(false);
      setData(items);
    });
    return () => {
      sub.unsubscribe();
    };
  }, [userData?.id]);

  useEffect(() => {
    let total = 0;
    cartProducts?.map((item: any) => {
      let itemprice = parseFloat(item.Product.price) * item.quantity;
      total = total + itemprice;
    });
    setTotalAmount(total);
  }, [cartProducts]);

  const renderItem = ({item, index}: any) => {
    return (
      <View style={styles.item}>
        <TouchableOpacity
          onPress={() => {
            setSelectedAddress(item.id);
          }}
          style={{
            marginTop: index === 0 ? getScreenHeight(2):  getScreenHeight(0.1),
          }}>
          <AddressItem
            backgroundColor={
              selectedAddress === item.id ? '#C2AFDB' : 'lavender'
            }
            hide
            item={item}
          />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading || orderLoading) {
    return <FullScreenLoader />;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <CustomStatusBar light color={theme.primary} />
      <View style={styles.screen}>
        <CustomHeader title="Select Addresses" />

        <FlatList
          data={data}
          ListEmptyComponent={() => (
            <Text style={styles.title}>No Data Found!</Text>
          )}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{paddingHorizontal: getScreenHeight(2)}}
        />

        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={[styles.title, {margin: getScreenHeight(2),color:theme.primary,fontSize:getScreenHeight(2.3)}]}>
            Total Amount:{' '}
          </Text>
          <Text style={[styles.title, {margin: getScreenHeight(2),color:"#8560B7",fontSize:getScreenHeight(2.3),fontWeight:'bold'}]}>
            {' '}
            {'$' + totalAmount.toFixed(2)}
          </Text>
        </View>

        <View style={{padding: getScreenHeight(2)}}>
          <CustomButton
            title="Add Address"
            action={() => navigate('AddAddress', {})}
          />
          <View style={{padding: getScreenHeight(0.5)}}></View>
          <CustomButton
            title="Place Order"
            action={() => {
              if (selectedAddress) {
                dispatch<any>(createOrderManager(selectedAddress, totalAmount));
              } else {
                showToast('Please select an address!');
              }
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: {
      backgroundColor: theme.white,
      flex: 1,
    },
    safe: {
      backgroundColor: theme.primary,
      flex: 1,
    },
    item: {
      marginBottom: getScreenHeight(2),
    },
    contanier: {
      paddingHorizontal: getScreenHeight(2),
    },
    title: {
      color: theme.black,
      fontSize: getScreenHeight(1.8),
    },
    row: {
      padding: getScreenHeight(1),
      paddingHorizontal: getScreenHeight(2),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    subtitle: {
      color: theme.black,
      fontSize: getScreenHeight(1.8),
    },
  });

export default ChooseAddress;
